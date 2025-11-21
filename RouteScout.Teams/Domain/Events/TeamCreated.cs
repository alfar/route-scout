namespace RouteScout.Teams.Domain.Events;

public record TeamCreated(Guid TeamId, string TrailerSize, string LeaderName, string LeaderPhone, IReadOnlyList<string> Members);
