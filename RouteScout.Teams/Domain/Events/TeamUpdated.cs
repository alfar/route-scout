namespace RouteScout.Teams.Domain.Events;

public record TeamUpdated(Guid TeamId, string TrailerSize, string LeaderName, string LeaderPhone, IReadOnlyList<string> Members);
