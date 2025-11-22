namespace RouteScout.Teams.Domain.Events;

// TeamUpdated now excludes member list. Use TeamMemberAdded/TeamMemberRemoved for membership changes.
public record TeamUpdated(Guid TeamId, string TeamName, string TrailerSize, string LeaderName, string LeaderPhone);
