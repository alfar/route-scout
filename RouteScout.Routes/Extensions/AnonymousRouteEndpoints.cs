using Marten;
using Microsoft.CodeAnalysis;
using RouteScout.Routes.Domain;
using RouteScout.Routes.Domain.Events;
using RouteScout.Routes.IntegrationPoints;
using RouteScout.Routes.Integrations;
using RouteScout.Routes.Projections;

namespace RouteScout.Teams.Extensions;

public static class AnonymousRouteEndpoints
{
    public static IEndpointRouteBuilder MapAnonymousRouteEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("{teamId:guid}/routes", async (Guid teamId, IDocumentSession session) =>
        {
            var teamRoutes = await session.Query<RouteSummary>()
                .Where(r => r.TeamId == teamId && !r.Deleted && !r.Completed)
                .ToListAsync();
            return Results.Ok(teamRoutes);
        }).AllowAnonymous();

        app.MapGet("{teamId:guid}/stops", async (Guid teamId, IDocumentSession session) =>
        {
            var teamRoutes = await session.Query<RouteSummary>()
                .Where(r => r.TeamId == teamId && !r.Deleted && !r.Completed)
                .Select(r => r.Id)
                .ToListAsync();

            var stops = await session.Query<StopSummary>()
                .Where(s => teamRoutes.Contains(s.RouteId.Value) && !s.Deleted)
                .OrderBy(s => s.SortOrder)
                .ToListAsync();

            return Results.Ok(stops);
        });

        app.MapPost("/{teamId:guid}/stops/{stopId:guid}/complete",
            async (Guid teamId, Guid stopId, IDocumentSession session) =>
        {
            var stop = await session.LoadAsync<StopSummary>(stopId);
            if (stop is null || stop.Deleted) return Results.NotFound();
            if (stop.Status == StopStatus.Completed) return Results.Ok(); // idempotent
            session.Events.Append(stopId, new StopCompleted(stopId, stop.ProjectId));
            await session.SaveChangesAsync();
            return Results.Ok();
        }).AllowAnonymous();

        app.MapPost("/{teamId:guid}/stops/{stopId:guid}/not-found", async (Guid teamId, Guid stopId, IDocumentSession session, IEnumerable<IStopNotFoundEventHandler> handlers) =>
        {
            var stop = await session.LoadAsync<StopSummary>(stopId);
            if (stop is null || stop.Deleted) return Results.NotFound();
            if (stop.Status == StopStatus.NotFound) return Results.Ok();
            var notFoundEvent = new StopNotFound(stopId, stop.ProjectId);
            session.Events.Append(stopId, notFoundEvent);
            await session.SaveChangesAsync();

            foreach (var handler in handlers)
            {
                await handler.HandleAsync(notFoundEvent);
            }

            return Results.Ok();
        }).AllowAnonymous();

        app.MapPost("/{teamId:guid}/stops/{stopId:guid}/reset", async (Guid teamId, Guid stopId, IDocumentSession session) =>
        {
            var stop = await session.LoadAsync<StopSummary>(stopId);
            if (stop is null || stop.Deleted) return Results.NotFound();
            if (stop.Status == StopStatus.Pending) return Results.Ok();
            session.Events.Append(stopId, new StopReset(stopId, stop.ProjectId));
            await session.SaveChangesAsync();
            return Results.Ok();
        }).AllowAnonymous();

        // Extra trees endpoints
        app.MapPost("/{teamId:guid}/routes/{routeId:guid}/extra-trees/add/{amount:int}", async (Guid routeId, int amount, IDocumentSession session) =>
        {
            if (amount <= 0) return Results.BadRequest("Amount must be positive");
            var route = await session.LoadAsync<RouteSummary>(routeId);
            if (route is null || route.Deleted) return Results.NotFound();
            session.Events.Append(routeId, new RouteExtraTreesAdded(routeId, route.ProjectId, amount));
            await session.SaveChangesAsync();
            return Results.Ok();
        });

        app.MapPost("/{teamId:guid}/routes/{routeId:guid}/extra-trees/remove/{amount:int}", async (Guid routeId, int amount, IDocumentSession session) =>
        {
            if (amount <= 0) return Results.BadRequest("Amount must be positive");
            var route = await session.LoadAsync<RouteSummary>(routeId);
            if (route is null || route.Deleted) return Results.NotFound();
            if (route.ExtraTrees - amount < 0) return Results.BadRequest("Cannot reduce below zero");
            session.Events.Append(routeId, new RouteExtraTreesRemoved(routeId, route.ProjectId, amount));
            await session.SaveChangesAsync();
            return Results.Ok();
        });

        app.MapPost("/{teamId:guid}/routes/{id:guid}/cut-short", async (Guid teamId, IDocumentSession session, Guid id, IEnumerable<IRouteCutShortEventHandler> handlers) =>
        {
            var route = await session.LoadAsync<RouteSummary>(id);
            if (route is null || route.Deleted) return Results.NotFound();
            if (route.CutShort) return Results.BadRequest("Route already cut short");
            var @event = new RouteCutShort(id, route.ProjectId);
            session.Events.Append(id, @event);
            await session.SaveChangesAsync();

            foreach (var handler in handlers)
            {
                await handler.HandleAsync(@event);
            }

            return Results.Ok();
        }).AllowAnonymous();

        return app;
    }
}
