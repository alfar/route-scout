namespace RouteScout.Teams.Dto;

public record UpdateTeam(string TrailerSize, string LeaderName, string LeaderPhone, IReadOnlyList<string> Members);
