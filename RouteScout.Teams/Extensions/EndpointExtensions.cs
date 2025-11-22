using Marten;
using Microsoft.AspNetCore.Http.HttpResults;
using RouteScout.Teams.Dto;
using RouteScout.Teams.Projections;
using RouteScout.Teams.Services;

namespace RouteScout.Teams.Extensions;

public static class EndpointExtensions
{
    public static IEndpointRouteBuilder MapTeamEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("teams");

        group.MapPost("/", async (CreateTeam dto, ITeamService service, IQuerySession query) =>
        {
            if (string.IsNullOrWhiteSpace(dto.LeaderName)) return Results.BadRequest("Leader name required");
            var id = await service.CreateTeam(dto.TrailerSize, dto.LeaderName, dto.LeaderPhone);
            var summary = await query.LoadAsync<TeamSummary>(id);
            return Results.Created($"/api/teams/{id}", new { id, summary?.Name });
        });

        // Update team metadata (not members)
        group.MapPut("/{id:guid}", async (Guid id, UpdateTeam dto, ITeamService service, IQuerySession query, string? teamName) =>
        {
            // Allow optional ?teamName= override, else keep existing
            var existing = await query.LoadAsync<TeamSummary>(id);
            if (existing is null) return Results.NotFound();
            var newName = string.IsNullOrWhiteSpace(teamName) ? existing.Name : teamName;
            await service.UpdateTeam(id, newName, dto.TrailerSize, dto.LeaderName, dto.LeaderPhone);
            return Results.NoContent();
        });

        // Add a member (expects raw string body or query param "member")
        group.MapPost("/{id:guid}/members", async (Guid id, [AsParameters] MemberDto body, ITeamService service) =>
        {
            if (string.IsNullOrWhiteSpace(body.Member)) return Results.BadRequest("Member required");
            await service.AddMember(id, body.Member);
            return Results.Accepted();
        });

        // Remove a member
        group.MapDelete("/{id:guid}/members/{member}", async (Guid id, string member, ITeamService service) =>
        {
            await service.RemoveMember(id, member);
            return Results.NoContent();
        });

        group.MapGet("/{id:guid}", async (Guid id, IQuerySession query) =>
        {
            var summary = await query.LoadAsync<TeamSummary>(id);
            return summary is null ? Results.NotFound() : Results.Ok(summary);
        });

        group.MapGet("/", async (IQuerySession query) =>
        {
            var teams = await query.Query<TeamSummary>().ToListAsync();
            return Results.Ok(teams);
        });

        return app;
    }
}

public record MemberDto(string Member);
