namespace RouteScout.Teams.Services;

public interface ITeamService
{
    Task<Guid> CreateTeam(string trailerSize, string leaderName, string leaderPhone, IReadOnlyList<string> members);
    Task UpdateTeam(Guid teamId, string trailerSize, string leaderName, string leaderPhone);
    Task AddMember(Guid teamId, string member);
    Task RemoveMember(Guid teamId, string member);
}
