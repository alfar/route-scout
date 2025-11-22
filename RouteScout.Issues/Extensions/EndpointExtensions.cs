using Marten;
using RouteScout.Issues.Domain.Events;
using RouteScout.Issues.Dto;
using RouteScout.Issues.Projections;
using RouteScout.Issues.Services;
using System.Text;
using System.Text.Json;

namespace RouteScout.Issues.Extensions;

public static class EndpointExtensions
{
    public static IEndpointRouteBuilder MapIssueEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/issues").WithTags("Issues");

        group.MapGet("", async (IDocumentSession session) =>
        {
            var issues = await session.Query<IssueSummary>().ToListAsync();
            return Results.Ok(issues);
        });

        group.MapGet("/{id:guid}", async (IDocumentSession session, Guid id) =>
        {
            var issue = await session.LoadAsync<IssueSummary>(id);
            return issue is not null ? Results.Ok(issue) : Results.NotFound();
        });

        group.MapPost("", async (IIssueService service, CreateIssue dto) =>
        {
            if (string.IsNullOrWhiteSpace(dto.Type) || string.IsNullOrWhiteSpace(dto.Text))
                return Results.BadRequest("Type and Text are required");
            var id = await service.CreateIssue(dto.Type, dto.Text);
            return Results.Created($"/issues/{id}", id);
        });

        group.MapPost("/{id:guid}/done", async (IDocumentSession session, IssueStreamService stream, Guid id) =>
        {
            var issue = await session.LoadAsync<IssueSummary>(id);
            if (issue is null) return Results.NotFound();
            if (issue.Done) return Results.Ok(); // idempotent
            session.Events.Append(id, new IssueMarkedDone(id, DateTimeOffset.UtcNow));
            await session.SaveChangesAsync();
            var updated = await session.LoadAsync<IssueSummary>(id);
            if (updated is not null)
            {
                await stream.PublishAsync("done", updated);
            }
            return Results.Ok();
        });

        // Server-Sent Events endpoint
        group.MapGet("/stream", async (HttpContext context, IssueStreamService stream, IDocumentSession session) =>
        {
            context.Response.Headers.Add("Content-Type", "text/event-stream");
            context.Response.Headers.Add("Cache-Control", "no-cache");
            context.Response.Headers.Add("X-Accel-Buffering", "no"); // disable buffering for nginx if used

            var response = context.Response;
            var cts = CancellationTokenSource.CreateLinkedTokenSource(context.RequestAborted);

            async Task SendAsync(string eventType, IssueSummary summary)
            {
                var json = System.Text.Json.JsonSerializer.Serialize(summary, JsonSerializerOptions.Web);
                var sb = new StringBuilder();
                sb.AppendLine($"event: {eventType}");
                sb.AppendLine($"data: {json}");
                sb.AppendLine();
                await response.WriteAsync(sb.ToString());
                await response.Body.FlushAsync();
            }

            // initial backlog optional (send all unresolved issues)
            var lastIssues = await session.Query<IssueSummary>()
                .Where(i => !i.Done)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();

            foreach (var issue in lastIssues.OrderBy(i => i.CreatedAt))
            {
                await SendAsync("snapshot", issue);
            }

            var subId = stream.Subscribe(async (type, summary) =>
            {
                if (!cts.IsCancellationRequested)
                {
                    await SendAsync(type, summary);
                }
            });

            try
            {
                // Keep the connection open until client disconnects
                while (!cts.IsCancellationRequested)
                {
                    await Task.Delay(1000, cts.Token); // heartbeat interval
                }
            }
            catch (TaskCanceledException) { }
            finally
            {
                stream.Unsubscribe(subId);
            }
        });

        return app;
    }
}
