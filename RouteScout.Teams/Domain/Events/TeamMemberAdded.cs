namespace RouteScout.Teams.Domain.Events;

public record TeamMemberAdded(Guid TeamId, string Member);
