using Marten;
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
        group.MapPost("/", async (IDocumentSession session, CreateProject dto) =>
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return Results.BadRequest("Project name is required");

            var projectId = Guid.NewGuid();
            var ownerIds = dto.OwnerIds ?? new List<Guid>();
            
            var events = Project.Create(projectId, dto.Name.Trim(), ownerIds);
            session.Events.StartStream<Project>(projectId, events.ToArray());
            await session.SaveChangesAsync();

            return Results.Created($"/api/projects/{projectId}", new { id = projectId, name = dto.Name });
        });

        // Get all projects
        group.MapGet("/", async (IQuerySession session) =>
        {
            var projects = await session.Query<ProjectSummary>().ToListAsync();
            return Results.Ok(projects);
        });

        // Get a specific project by ID
        group.MapGet("/{id:guid}", async (IQuerySession session, Guid id) =>
        {
            var project = await session.LoadAsync<ProjectSummary>(id);
            return project is not null ? Results.Ok(project) : Results.NotFound();
        });

        // Rename a project
        group.MapPatch("/{id:guid}/name", async (IDocumentSession session, Guid id, RenameProject dto) =>
        {
            if (string.IsNullOrWhiteSpace(dto.NewName))
                return Results.BadRequest("New name is required");

            var project = await session.Events.AggregateStreamAsync<Project>(id);
            if (project is null)
                return Results.NotFound("Project not found");

            var events = project.Rename(dto.NewName.Trim());
            session.Events.Append(id, events.ToArray());
            await session.SaveChangesAsync();

            return Results.Ok();
        });

        // Add an owner to a project
        group.MapPost("/{id:guid}/owners/{ownerId:guid}", async (IDocumentSession session, Guid id, Guid ownerId) =>
        {
            var project = await session.Events.AggregateStreamAsync<Project>(id);
            if (project is null)
                return Results.NotFound("Project not found");

            var events = project.AddOwner(ownerId);
            session.Events.Append(id, events.ToArray());
            await session.SaveChangesAsync();

            return Results.Ok();
        });

        // Remove an owner from a project
        group.MapDelete("/{id:guid}/owners/{ownerId:guid}", async (IDocumentSession session, Guid id, Guid ownerId) =>
        {
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
