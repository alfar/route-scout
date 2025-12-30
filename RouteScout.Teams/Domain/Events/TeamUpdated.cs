using RouteScout.Contracts;

namespace RouteScout.Teams.Domain.Events;

public record TeamUpdated(Guid TeamId, Guid ProjectId, string TeamName, string TrailerSize, string LeaderName, string LeaderPhone) : IProjectEvent;
