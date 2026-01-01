using Marten;
using RouteScout.Teams.Dto;
using RouteScout.Teams.Projections;
using RouteScout.Teams.Services;

namespace RouteScout.Teams.Extensions;

public static class AnonymousTeamEndpoints
{
    public static IEndpointRouteBuilder MapAnonymousTeamEndpoints(this IEndpointRouteBuilder app)
    {
        // Get team by ID (no projectId required)
        app.MapGet("/{id:guid}", async (Guid id, IQuerySession query) =>
        {
            var team = await query.LoadAsync<TeamSummary>(id);
            return team is null ? Results.NotFound() : Results.Ok(team);
        }).AllowAnonymous();

        // Update team metadata (not members)
        app.MapPut("/{id:guid}", async (Guid id, UpdateTeam dto, ITeamService service, IQuerySession query) =>
        {
            var existing = await query.LoadAsync<TeamSummary>(id);
            if (existing is null) return Results.NotFound();
            var newName = string.IsNullOrWhiteSpace(dto.Name) ? existing.Name : dto.Name;
            await service.UpdateTeam(id, existing.ProjectId, newName, dto.TrailerSize, dto.LeaderName, dto.LeaderPhone);
            return Results.NoContent();
        }).AllowAnonymous();

        // Add a member (expects raw string body or query param "member")
        app.MapPost("/{id:guid}/members", async (Guid id, MemberDto body, ITeamService service) =>
        {
            if (string.IsNullOrWhiteSpace(body.Member)) return Results.BadRequest("Member required");
            await service.AddMember(id, body.Member);
            return Results.Accepted();
        }).AllowAnonymous();

        // Remove a member
        app.MapDelete("/{id:guid}/members/{member}", async (Guid id, string member, ITeamService service) =>
        {
            await service.RemoveMember(id, member);
            return Results.NoContent();
        }).AllowAnonymous();

        return app;
    }
}
