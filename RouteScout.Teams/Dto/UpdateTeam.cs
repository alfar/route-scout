namespace RouteScout.Teams.Dto;

// Members removed from update; membership managed via separate add/remove endpoints
public record UpdateTeam(string Name, string TrailerSize, string LeaderName, string LeaderPhone);
