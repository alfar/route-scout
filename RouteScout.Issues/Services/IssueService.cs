using Marten;
using RouteScout.Issues.Domain.Events;
using RouteScout.Issues.Projections;

namespace RouteScout.Issues.Services;

public class IssueService : IIssueService
{
    private readonly IDocumentSession _session;
    private readonly IssueStreamService _stream;

    public IssueService(IDocumentSession session, IssueStreamService stream)
    {
        _session = session;
        _stream = stream;
    }

    public async Task<Guid> CreateIssue(string type, string text)
    {
        if (string.IsNullOrWhiteSpace(type)) throw new ArgumentException("Type required", nameof(type));
        if (string.IsNullOrWhiteSpace(text)) throw new ArgumentException("Text required", nameof(text));

        var id = Guid.NewGuid();
        var evt = new IssueCreated(id, DateTimeOffset.UtcNow, type.Trim(), text.Trim());
        _session.Events.StartStream<Domain.Issue>(id, evt);
        await _session.SaveChangesAsync();

        // load projection snapshot to push downstream
        var summary = await _session.LoadAsync<IssueSummary>(id);
        if (summary is not null)
        {
            await _stream.PublishAsync("created", summary);
        }

        return id;
    }
}
