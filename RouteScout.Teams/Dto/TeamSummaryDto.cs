namespace RouteScout.Teams.Dto;

public record TeamSummaryDto(Guid Id, string TrailerSize, string LeaderName, string LeaderPhone, IReadOnlyList<string> Members);
