using Marten;
using RouteScout.Routes.Domain.Events;
using RouteScout.Routes.Dto;
using RouteScout.Routes.Projections;

namespace RouteScout.Routes.Extensions
{
    public static class EndpointExtensions
    {
        public static IEndpointRouteBuilder MapRouteEndpoints(this IEndpointRouteBuilder app)
        {
            // Stops Endpoints
            app.MapGet("/stops", async (IDocumentSession session) =>
            {
                var stops = await session.Query<StopSummary>().Where(s => !s.Deleted).ToListAsync();
                return Results.Ok(stops);
            });

            app.MapGet("/stops/{id:guid}", async (IDocumentSession session, Guid id) =>
            {
                var stop = await session.LoadAsync<StopSummary>(id);
                return stop is not null && !stop.Deleted ? Results.Ok(stop) : Results.NotFound();
            });

            app.MapPost("/stops", async (IDocumentSession session, CreateStop dto) =>
            {
                var stopId = Guid.NewGuid();
                var evt = new StopCreated(stopId, dto.AddressId, dto.StreetId, dto.StreetName, dto.HouseNumber, dto.Amount);
                session.Events.StartStream<Domain.Stop>(stopId, evt);
                await session.SaveChangesAsync();
                return Results.Created($"/stops/{stopId}", stopId);
            });

            app.MapDelete("/stops/{id:guid}", async (IDocumentSession session, Guid id) =>
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

            // Routes Endpoints

            app.MapGet("/routes", async (IDocumentSession session) =>
            {
                var routes = await session.Query<RouteSummary>().Where(r => !r.Deleted).ToListAsync();
                return Results.Ok(routes);
            });

            app.MapGet("/routes/{id:guid}", async (IDocumentSession session, Guid id) =>
            {
                var route = await session.LoadAsync<RouteSummary>(id);
                return route is not null && !route.Deleted ? Results.Ok(route) : Results.NotFound();
            });

            app.MapPost("/routes", async (IDocumentSession session, CreateRoute dto) =>
            {
                var routeId = Guid.NewGuid();
                var evt = new RouteCreated(routeId, dto.Name, dto.DropOffPoint);
                session.Events.StartStream<Domain.Route>(routeId, evt);
                await session.SaveChangesAsync();
                return Results.Created($"/routes/{routeId}", routeId);
            });

            app.MapDelete("/routes/{id:guid}", async (IDocumentSession session, Guid id) =>
            {
                // Find all stops assigned to this route
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

            app.MapPatch("/routes/{id:guid}/name", async (IDocumentSession session, Guid id, RenameRoute dto) =>
            {
                var evt = new RouteRenamed(id, dto.NewName);
                session.Events.Append(id, evt);
                await session.SaveChangesAsync();
                return Results.Ok();
            });

            app.MapPatch("/routes/{id:guid}/dropoff-point", async (IDocumentSession session, Guid id, ChangeDropOffPoint dto) =>
            {
                var evt = new RouteDropOffPointChanged(id, dto.NewDropOffPoint);
                session.Events.Append(id, evt);
                await session.SaveChangesAsync();
                return Results.Ok();
            });

            app.MapPatch("/routes/{routeId:guid}/stops/{stopId:guid}", async (IDocumentSession session, Guid routeId, Guid stopId, AddStopToRoute dto) =>
            {
                var evt = new StopAddedToRoute(routeId, stopId, dto.Position);
                session.Events.Append(routeId, evt);

                var evt2 = new StopAssignedToRoute(stopId, routeId);
                session.Events.Append(stopId, evt2);

                await session.SaveChangesAsync();
                return Results.Ok();
            });

            app.MapDelete("/routes/{routeId:guid}/stops/{stopId:guid}", async (IDocumentSession session, Guid routeId, Guid stopId) =>
            {
                var evt = new StopRemovedFromRoute(routeId, stopId);
                session.Events.Append(routeId, evt);

                var evt2 = new StopUnassignedFromRoute(stopId, routeId);
                session.Events.Append(stopId, evt2);

                await session.SaveChangesAsync();
                return Results.NoContent();
            });

            app.MapPost("/routes/{id:guid}/split", async (IDocumentSession session, Guid id, SplitRoute dto) =>
            {
                var newRouteId1 = Guid.NewGuid();
                var newRouteId2 = Guid.NewGuid();

                var sourceRoute = await session.LoadAsync<Domain.Route>(id);
                if (sourceRoute is null) return Results.NotFound();

                for (int i = 0; i < dto.Position; i++)
                {
                    var stop = sourceRoute.Stops[i];
                    session.Events.Append(stop, new StopAssignedToRoute(stop, newRouteId1));
                    session.Events.Append(newRouteId1, new StopAddedToRoute(newRouteId1, stop, i));
                }

                for (int i = dto.Position; i < sourceRoute.Stops.Count; i++)
                {
                    var stop = sourceRoute.Stops[i];
                    session.Events.Append(stop, new StopAssignedToRoute(stop, newRouteId2));
                    session.Events.Append(newRouteId2, new StopAddedToRoute(newRouteId2, stop, i - dto.Position));
                }

                var evt = new RouteSplitPerformed(id, newRouteId1, newRouteId2, dto.Position);
                session.Events.Append(id, evt);
                await session.SaveChangesAsync();
                return Results.Ok();
            });

            app.MapPost("/routes/{id:guid}/merge", async (IDocumentSession session, Guid id, MergeRoute dto) =>
            {
                var sourceRoute = await session.LoadAsync<Domain.Route>(id);
                if (sourceRoute is null) return Results.NotFound();

                var targetRoute = await session.LoadAsync<Domain.Route>(dto.MergeIntoRouteId);
                if (targetRoute is null) return Results.BadRequest();

                var position = targetRoute.Stops.Count;
                foreach (var stop in sourceRoute.Stops)
                {
                    session.Events.Append(dto.MergeIntoRouteId, new StopAddedToRoute(dto.MergeIntoRouteId, stop, position++));
                }

                var evt = new RouteMerged(id, dto.MergeIntoRouteId);
                session.Events.Append(id, evt);
                await session.SaveChangesAsync();
                return Results.Ok();
            });

            return app;
        }
    }
}
