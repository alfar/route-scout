namespace RouteScout.Teams.Domain.Events;

public record TeamCreated(Guid TeamId, string TeamName, string TrailerSize, string LeaderName, string LeaderPhone);
