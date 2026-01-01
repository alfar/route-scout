using Marten;
using Microsoft.AspNetCore.Authorization;
using RouteScout.Contracts;
using RouteScout.Projects.Domain;
using RouteScout.Projects.Dto;
using RouteScout.Projects.Projections;

namespace RouteScout.Projects.Extensions;

public static class EndpointExtensions
{
    public static IEndpointRouteBuilder MapProjectEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/projects").WithTags("Projects");

        // Create a new project
        group.MapPost("/", [Authorize] async (
            IDocumentSession session, 
            ICurrentUserService currentUserService,
            CreateProject dto) =>
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return Results.BadRequest("Project name is required");

            var userId = currentUserService.GetUserId();
            if (userId == null)
                return Results.Unauthorized();

            var projectId = Guid.NewGuid();
            
            // Add current user as owner automatically
            var ownerIds = new List<Guid> { userId.Value };
            if (dto.OwnerIds != null)
            {
                // Add any additional owners from the DTO
                ownerIds.AddRange(dto.OwnerIds.Where(id => id != userId.Value));
            }
            
            var events = Project.Create(projectId, dto.Name.Trim(), ownerIds);
            session.Events.StartStream<Project>(projectId, events.ToArray());
            await session.SaveChangesAsync();

            return Results.Created($"/api/projects/{projectId}", new { id = projectId, name = dto.Name });
        });

        // Get all projects - only show projects owned by current user
        group.MapGet("/", [Authorize] async (
            IQuerySession session,
            ICurrentUserService currentUserService) =>
        {
            var userId = currentUserService.GetUserId();
            if (userId == null)
                return Results.Unauthorized();

            var projects = await session.Query<ProjectSummary>()
                .Where(p => p.OwnerIds.Contains(userId.Value))
                .ToListAsync();
            
            return Results.Ok(projects);
        });

        // Get a specific project by ID
        group.MapGet("/{id:guid}", [Authorize] async (
            IQuerySession session,
            ICurrentUserService currentUserService,
            Guid id) =>
        {
            var userId = currentUserService.GetUserId();
            if (userId == null)
                return Results.Unauthorized();

            var project = await session.LoadAsync<ProjectSummary>(id);
            
            if (project is null)
                return Results.NotFound();
            
            if (!project.OwnerIds.Contains(userId.Value))
                return Results.Forbid();

            return Results.Ok(project);
        });

        // Rename a project
        group.MapPatch("/{id:guid}/name", [Authorize] async (
            IDocumentSession session,
            ICurrentUserService currentUserService,
            Guid id,
            RenameProject dto) =>
        {
            if (string.IsNullOrWhiteSpace(dto.NewName))
                return Results.BadRequest("New name is required");

            var userId = currentUserService.GetUserId();
            if (userId == null)
                return Results.Unauthorized();

            var projectSummary = await session.LoadAsync<ProjectSummary>(id);
            if (projectSummary is null)
                return Results.NotFound("Project not found");

            if (!projectSummary.OwnerIds.Contains(userId.Value))
                return Results.Forbid();

            var project = await session.Events.AggregateStreamAsync<Project>(id);
            if (project is null)
                return Results.NotFound("Project not found");

            var events = project.Rename(dto.NewName.Trim());
            session.Events.Append(id, events.ToArray());
            await session.SaveChangesAsync();

            return Results.Ok();
        });

        // Add an owner to a project
        group.MapPost("/{id:guid}/owners/{ownerId:guid}", [Authorize] async (
            IDocumentSession session,
            ICurrentUserService currentUserService,
            Guid id,
            Guid ownerId) =>
        {
            var userId = currentUserService.GetUserId();
            if (userId == null)
                return Results.Unauthorized();

            var projectSummary = await session.LoadAsync<ProjectSummary>(id);
            if (projectSummary is null)
                return Results.NotFound("Project not found");

            if (!projectSummary.OwnerIds.Contains(userId.Value))
                return Results.Forbid();

            var project = await session.Events.AggregateStreamAsync<Project>(id);
            if (project is null)
                return Results.NotFound("Project not found");

            var events = project.AddOwner(ownerId);
            session.Events.Append(id, events.ToArray());
            await session.SaveChangesAsync();

            return Results.Ok();
        });

        // Remove an owner from a project
        group.MapDelete("/{id:guid}/owners/{ownerId:guid}", [Authorize] async (
            IDocumentSession session,
            ICurrentUserService currentUserService,
            Guid id,
            Guid ownerId) =>
        {
            var userId = currentUserService.GetUserId();
            if (userId == null)
                return Results.Unauthorized();

            var projectSummary = await session.LoadAsync<ProjectSummary>(id);
            if (projectSummary is null)
                return Results.NotFound("Project not found");

            if (!projectSummary.OwnerIds.Contains(userId.Value))
                return Results.Forbid();

            var project = await session.Events.AggregateStreamAsync<Project>(id);
            if (project is null)
                return Results.NotFound("Project not found");

            var events = project.RemoveOwner(ownerId);
            session.Events.Append(id, events.ToArray());
            await session.SaveChangesAsync();

            return Results.NoContent();
        });

        return app;
    }
}
