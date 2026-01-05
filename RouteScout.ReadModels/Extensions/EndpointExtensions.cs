using Marten;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using RouteScout.ReadModels.Projections;

namespace RouteScout.Payments.Endpoints;

public static class EndpointExtensions
{
    public static IEndpointRouteBuilder MapReadModelsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/processingqueue").WithTags("ProcessingQueue");

        group.MapGet("/", async (Guid projectId, IDocumentSession session) =>
        {
            var queueItems = await session.Query<ProcessingQueueItem>()
                .Where(p => p.ProjectId == projectId)
                .ToListAsync();
            return Results.Ok(queueItems);
        });

        return app;
    }
}
