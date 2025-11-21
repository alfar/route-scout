using Marten;
using QRCoder;
using RouteScout.Teams.Domain.Events;

namespace RouteScout.Teams.Services;

public class TeamService : ITeamService
{
    private readonly IDocumentSession _session;

    public TeamService(IDocumentSession session)
    {
        _session = session;
    }

    public async Task<Guid> CreateTeam(string trailerSize, string leaderName, string leaderPhone, IReadOnlyList<string> members)
    {
        var teamId = Guid.NewGuid();
        var created = new TeamCreated(teamId, trailerSize, leaderName, leaderPhone, members);
        _session.Events.Append(teamId, created);
        await _session.SaveChangesAsync();
        return teamId;
    }

    public async Task UpdateTeam(Guid teamId, string trailerSize, string leaderName, string leaderPhone, IReadOnlyList<string> members)
    {
        var updated = new TeamUpdated(teamId, trailerSize, leaderName, leaderPhone, members);
        _session.Events.Append(teamId, updated);
        await _session.SaveChangesAsync();
    }
}
