namespace RouteScout.Issues.Services;

public interface IIssueService
{
    Task<Guid> CreateIssue(string type, string text);
}
