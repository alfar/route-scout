namespace RouteScout.Projects.Dto;

public record CreateProject(string Name, List<Guid>? OwnerIds);
