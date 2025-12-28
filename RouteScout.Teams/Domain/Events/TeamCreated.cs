namespace RouteScout.Teams.Domain.Events;

public record TeamCreated(Guid TeamId, Guid ProjectId, string TeamName, string TrailerSize, string LeaderName, string LeaderPhone);
