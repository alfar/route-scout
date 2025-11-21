namespace RouteScout.Teams.Domain.Events;

public record TeamMemberRemoved(Guid TeamId, string Member);
