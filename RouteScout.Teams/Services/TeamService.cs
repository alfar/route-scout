using Marten;
using RouteScout.Teams.Domain.Events;
using RouteScout.Teams.Projections;

namespace RouteScout.Teams.Services;

public class TeamService : ITeamService
{
    private readonly IDocumentSession _session;

    public TeamService(IDocumentSession session)
    {
        _session = session;
    }

    public async Task<Guid> CreateTeam(string trailerSize, string leaderName, string leaderPhone)
    {
        var teamId = Guid.NewGuid();

        // Determine next sequential number by counting existing teams (projection snapshots)
        var existingCount = await _session.Query<TeamSummary>().CountAsync(); // requires using RouteScout.Teams.Projections; but keep logic concise
        var teamName = $"Team {existingCount + 1}";

        var created = new TeamCreated(teamId, teamName, trailerSize, leaderName, leaderPhone);
        _session.Events.Append(teamId, created);
        await _session.SaveChangesAsync();
        return teamId;
    }

    public async Task UpdateTeam(Guid teamId, string teamName, string trailerSize, string leaderName, string leaderPhone)
    {
        var updated = new TeamUpdated(teamId, teamName, trailerSize, leaderName, leaderPhone);
        _session.Events.Append(teamId, updated);
        await _session.SaveChangesAsync();
    }

    public async Task AddMember(Guid teamId, string member)
    {
        _session.Events.Append(teamId, new TeamMemberAdded(teamId, member));
        await _session.SaveChangesAsync();
    }

    public async Task RemoveMember(Guid teamId, string member)
    {
        _session.Events.Append(teamId, new TeamMemberRemoved(teamId, member));
        await _session.SaveChangesAsync();
    }
}
