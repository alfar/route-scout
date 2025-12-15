using Marten;
using RouteScout.Routes.Domain.Events;
using RouteScout.Routes.Dto;
using RouteScout.Routes.IntegrationPoints;
using RouteScout.Routes.Integrations;
using RouteScout.Routes.Projections;
using RouteScout.Routes.Domain;

namespace RouteScout.Routes.Extensions
{
    public static class EndpointExtensions
    {
        public static IEndpointRouteBuilder MapRouteEndpoints(this IEndpointRouteBuilder app)
        {
            var stopGroup = app.MapGroup("/stops").WithTags("Stops");

            // Stops Endpoints
            stopGroup.MapGet("", async (IDocumentSession session) =>
            {
                var stops = await session.Query<StopSummary>().Where(s => !s.Deleted).OrderBy(s => s.SortOrder).ToListAsync();
                return Results.Ok(stops);
            });

            stopGroup.MapGet("/{id:guid}", async (IDocumentSession session, Guid id) =>
            {
                var stop = await session.LoadAsync<StopSummary>(id);
                return stop is not null && !stop.Deleted ? Results.Ok(stop) : Results.NotFound();
            });

            stopGroup.MapDelete("/{id:guid}", async (IDocumentSession session, Guid id) =>
            {
                var stop = await session.LoadAsync<StopSummary>(id);
                if (stop is null) return Results.NotFound();

                if (stop.RouteId.HasValue)
                {
                    var evt = new StopRemovedFromRoute(stop.RouteId.Value, id);
                    session.Events.Append(stop.RouteId.Value, evt);
                }

                session.Events.Append(id, new StopDeleted(id));
                await session.SaveChangesAsync();
                return Results.NoContent();
            });

            stopGroup.MapPost("/{id:guid}/unassign", async (IDocumentSession session, Guid id) =>
            {
                var stop = await session.LoadAsync<StopSummary>(id);
                if (stop is null) return Results.NotFound();

                if (stop.RouteId.HasValue)
                {
                    var evt = new StopRemovedFromRoute(stop.RouteId.Value, id);
                    session.Events.Append(stop.RouteId.Value, evt);
                    session.Events.Append(id, new StopUnassignedFromRoute(id, stop.RouteId.Value));
                    await session.SaveChangesAsync();
                }

                return Results.NoContent();
            });

            // Stop status endpoints
            stopGroup.MapPost("/{id:guid}/complete", async (IDocumentSession session, Guid id) =>
            {
                var stop = await session.LoadAsync<StopSummary>(id);
                if (stop is null || stop.Deleted) return Results.NotFound();
                if (stop.Status == StopStatus.Completed) return Results.Ok(); // idempotent
                session.Events.Append(id, new StopCompleted(id));
                await session.SaveChangesAsync();
                return Results.Ok();
            });

            stopGroup.MapPost("/{id:guid}/not-found", async (IDocumentSession session, Guid id, IEnumerable<IStopNotFoundEventHandler> handlers) =>
            {
                var stop = await session.LoadAsync<StopSummary>(id);
                if (stop is null || stop.Deleted) return Results.NotFound();
                if (stop.Status == StopStatus.NotFound) return Results.Ok();
                var notFoundEvent = new StopNotFound(id);
                session.Events.Append(id, notFoundEvent);
                await session.SaveChangesAsync();

                foreach (var handler in handlers)
                {
                    await handler.HandleAsync(notFoundEvent);
                }

                return Results.Ok();
            });

            stopGroup.MapPost("/{id:guid}/reset", async (IDocumentSession session, Guid id) =>
            {
                var stop = await session.LoadAsync<StopSummary>(id);
                if (stop is null || stop.Deleted) return Results.NotFound();
                if (stop.Status == StopStatus.Pending) return Results.Ok();
                session.Events.Append(id, new StopReset(id));
                await session.SaveChangesAsync();
                return Results.Ok();
            });


            // Routes Endpoints
            var routeGroup = app.MapGroup("/routes").WithTags("Routes");

            routeGroup.MapGet("", async (IDocumentSession session) =>
            {
                var routes = await session.Query<RouteSummary>().Where(r => !r.Deleted).ToListAsync();
                return Results.Ok(routes);
            });

            routeGroup.MapGet("/{id:guid}", async (IDocumentSession session, Guid id) =>
            {
                var route = await session.LoadAsync<RouteSummary>(id);
                return route is not null && !route.Deleted ? Results.Ok(route) : Results.NotFound();
            });

            // New: Get routes by team
            routeGroup.MapGet("/team/{teamId:guid}", async (IDocumentSession session, Guid teamId) =>
            {
                var teamRoutes = await session.Query<RouteSummary>()
                    .Where(r => r.TeamId == teamId && !r.Deleted)
                    .ToListAsync();
                return Results.Ok(teamRoutes);
            });

            routeGroup.MapPost("", async (IDocumentSession session, CreateRoute dto) =>
            {
                // Load current area sequence aggregate (event-sourced)
                var areaSeq = await session.LoadAsync<RouteAreaSequence>(dto.AreaId);
                var currentSeq = areaSeq?.NextValue ?? 1;

                // Build route name with sequence number
                var routeId = Guid.NewGuid();
                var routeName = string.IsNullOrWhiteSpace(dto.AreaName) ? dto.AreaName : $"{dto.AreaName} - {currentSeq}";

                // Start route stream
                var evt = new RouteCreated(routeId, routeName, dto.DropOffPoint);
                session.Events.StartStream<Domain.Route>(routeId, evt);

                // Emit RouteCreatedInArea to area sequence stream (start new if missing)
                var areaEvent = new RouteCreatedInArea(dto.AreaId);
                if (areaSeq is null)
                {
                    session.Events.StartStream<RouteAreaSequence>(dto.AreaId, areaEvent);
                }
                else
                {
                    session.Events.Append(dto.AreaId, areaEvent);
                }

                await session.SaveChangesAsync();
                return Results.Created($"/routes/{routeId}", routeId);
            });

            routeGroup.MapDelete("/{id:guid}", async (IDocumentSession session, Guid id) =>
            {
                var stops = await session.Query<StopSummary>().Where(s => s.RouteId == id && !s.Deleted).ToListAsync();
                foreach (var stop in stops)
                {
                    var evt = new StopUnassignedFromRoute(stop.Id, id);
                    session.Events.Append(stop.Id, evt);
                }

                session.Events.Append(id, new RouteDeleted(id));
                await session.SaveChangesAsync();
                return Results.NoContent();
            });

            routeGroup.MapPatch("/{id:guid}/name", async (IDocumentSession session, Guid id, RenameRoute dto) =>
            {
                var evt = new RouteRenamed(id, dto.NewName);
                session.Events.Append(id, evt);
                await session.SaveChangesAsync();
                return Results.Ok();
            });

            routeGroup.MapPatch("/{id:guid}/dropoff-point", async (IDocumentSession session, Guid id, ChangeDropOffPoint dto) =>
            {
                var evt = new RouteDropOffPointChanged(id, dto.NewDropOffPoint);
                session.Events.Append(id, evt);
                await session.SaveChangesAsync();
                return Results.Ok();
            });

            routeGroup.MapPatch("/{routeId:guid}/stops/{stopId:guid}", async (IDocumentSession session, Guid routeId, Guid stopId, AddStopToRoute dto) =>
            {
                var stop = await session.LoadAsync<StopSummary>(stopId);
                if (stop is null || stop.Deleted) return Results.NotFound();

                if (stop.RouteId is not null)
                {
                    var unassignEvent = new StopRemovedFromRoute(stop.RouteId.Value, stopId);
                    session.Events.Append(stop.RouteId.Value, unassignEvent);
                }

                var evt = new StopAddedToRoute(routeId, stopId, dto.Position, stop.StreetName, stop.HouseNumber, stop.Amount);
                session.Events.Append(routeId, evt);

                var evt2 = new StopAssignedToRoute(stopId, routeId);
                session.Events.Append(stopId, evt2);

                await session.SaveChangesAsync();
                return Results.Ok();
            });

            routeGroup.MapDelete("/{routeId:guid}/stops/{stopId:guid}", async (IDocumentSession session, Guid routeId, Guid stopId) =>
            {
                var evt = new StopRemovedFromRoute(routeId, stopId);
                session.Events.Append(routeId, evt);

                var evt2 = new StopUnassignedFromRoute(stopId, routeId);
                session.Events.Append(stopId, evt2);

                await session.SaveChangesAsync();
                return Results.NoContent();
            });

            routeGroup.MapPost("/{id:guid}/split", async (IDocumentSession session, Guid id, SplitRoute dto) =>
            {
                var newRouteId1 = Guid.NewGuid();
                var newRouteId2 = Guid.NewGuid();

                var sourceRoute = await session.LoadAsync<Domain.Route>(id);
                if (sourceRoute is null) return Results.NotFound();

                for (int i = 0; i < dto.Position; i++)
                {
                    var stop = sourceRoute.Stops[i];
                    session.Events.Append(stop, new StopAssignedToRoute(stop, newRouteId1));
                    // NOTE: stop details not available here without lookup; skipping for split scenario.
                    session.Events.Append(newRouteId1, new StopAddedToRoute(newRouteId1, stop, i, string.Empty, string.Empty, 0));
                }

                for (int i = dto.Position; i < sourceRoute.Stops.Count; i++)
                {
                    var stop = sourceRoute.Stops[i];
                    session.Events.Append(stop, new StopAssignedToRoute(stop, newRouteId2));
                    session.Events.Append(newRouteId2, new StopAddedToRoute(newRouteId2, stop, i - dto.Position, string.Empty, string.Empty, 0));
                }

                var evt = new RouteSplitPerformed(id, newRouteId1, newRouteId2, dto.Position);
                session.Events.Append(id, evt);
                await session.SaveChangesAsync();
                return Results.Ok();
            });

            routeGroup.MapPost("/{id:guid}/merge", async (IDocumentSession session, Guid id, MergeRoute dto) =>
            {
                var sourceRoute = await session.LoadAsync<Domain.Route>(id);
                if (sourceRoute is null) return Results.NotFound();

                var targetRoute = await session.LoadAsync<Domain.Route>(dto.MergeIntoRouteId);
                if (targetRoute is null) return Results.BadRequest();

                var position = targetRoute.Stops.Count;
                foreach (var stop in sourceRoute.Stops)
                {
                    session.Events.Append(dto.MergeIntoRouteId, new StopAddedToRoute(dto.MergeIntoRouteId, stop, position++, string.Empty, string.Empty, 0));
                }

                var evt = new RouteMerged(id, dto.MergeIntoRouteId);
                session.Events.Append(id, evt);
                await session.SaveChangesAsync();
                return Results.Ok();
            });

            // Assign/unassign route to team endpoints
            routeGroup.MapPost("/{id:guid}/assign-team/{teamId:guid}", async (IDocumentSession session, Guid id, Guid teamId) =>
            {
                var route = await session.LoadAsync<RouteSummary>(id);
                if (route is null || route.Deleted) return Results.NotFound();
                session.Events.Append(id, new RouteAssignedToTeam(id, teamId));
                await session.SaveChangesAsync();
                return Results.Ok();
            });

            routeGroup.MapPost("/{id:guid}/unassign-team", async (IDocumentSession session, Guid id) =>
            {
                var route = await session.LoadAsync<RouteSummary>(id);
                if (route is null || route.Deleted || route.TeamId is null) return Results.NotFound();
                session.Events.Append(id, new RouteUnassignedFromTeam(id, route.TeamId.Value));
                await session.SaveChangesAsync();
                return Results.Ok();
            });

            // Extra trees endpoints
            routeGroup.MapPost("/{id:guid}/extra-trees/add/{amount:int}", async (IDocumentSession session, Guid id, int amount) =>
            {
                if (amount <= 0) return Results.BadRequest("Amount must be positive");
                var route = await session.LoadAsync<RouteSummary>(id);
                if (route is null || route.Deleted) return Results.NotFound();
                session.Events.Append(id, new RouteExtraTreesAdded(id, amount));
                await session.SaveChangesAsync();
                return Results.Ok();
            });

            routeGroup.MapPost("/{id:guid}/extra-trees/remove/{amount:int}", async (IDocumentSession session, Guid id, int amount) =>
            {
                if (amount <= 0) return Results.BadRequest("Amount must be positive");
                var route = await session.LoadAsync<RouteSummary>(id);
                if (route is null || route.Deleted) return Results.NotFound();
                if (route.ExtraTrees - amount < 0) return Results.BadRequest("Cannot reduce below zero");
                session.Events.Append(id, new RouteExtraTreesRemoved(id, amount));
                await session.SaveChangesAsync();
                return Results.Ok();
            });

            // Route cut short endpoint
            routeGroup.MapPost("/{id:guid}/cut-short", async (IDocumentSession session, Guid id, IEnumerable<IRouteCutShortEventHandler> handlers) =>
            {
                var route = await session.LoadAsync<RouteSummary>(id);
                if (route is null || route.Deleted) return Results.NotFound();
                if (route.CutShort) return Results.BadRequest("Route already cut short");
                var @event = new RouteCutShort(id);
                session.Events.Append(id, @event);
                await session.SaveChangesAsync();

                foreach (var handler in handlers)
                {
                    await handler.HandleAsync(@event);
                }

                return Results.Ok();
            });

            return app;
        }
    }
}
