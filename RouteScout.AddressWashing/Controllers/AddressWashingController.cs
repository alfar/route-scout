namespace RouteScout.AddressWashing.Controllers;

using Marten;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RouteScout.AddressWashing.Controllers.Dto;
using RouteScout.AddressWashing.Domain;
using RouteScout.AddressWashing.Events;
using RouteScout.AddressWashing.IntegrationPoints;
using RouteScout.AddressWashing.Projections;
using RouteScout.AddressWashing.Services;
using System;
using System.Linq;
using System.Threading.Channels;
using System.Threading.Tasks;

public static class AddressWashingController
{
    public static async Task<IResult> AddAddressTextAsync(Guid projectId, [FromBody] AddAddressDto dto, IAddressCandidateService addressCandidateService)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.RawAddress))
            return Results.BadRequest("raw address required");

        var id = await addressCandidateService.AddAddressCandidateAsync(dto.RawAddress, dto.PaymentId, dto.Amount, projectId);

        return Results.Created($"/api/projects/{projectId}/address-candidates/{id}", new { id });
    }

    public static async Task<IResult> GetCandidatesAsync(Guid projectId, IQuerySession q)
    {
        // Filter by projectId
        var addressCandidates = await q.Query<AddressCandidateSummary>()
            .Where(a => a.ProjectId == projectId && a.State != "Rejected" && a.State != "Confirmed")
            .Take(100)
            .ToListAsync();

        return Results.Ok(addressCandidates);
    }

    public static async Task<IResult> WashCandidateAsync(Guid id, IAddressWashingService washer, IDocumentSession session, Channel<(Guid Id, string RawAddress)> addressChannel)
    {
        var aggregate = await session.Events.AggregateStreamAsync<AddressCandidate>(id);

        if (aggregate == null) return Results.NotFound();

        await addressChannel.Writer.WriteAsync((aggregate.Id, aggregate.RawText.Trim()));

        return Results.NoContent();
    }

    public static async Task<IResult> ManualSelectAsync(Guid id, Guid addressId, IDocumentSession session)
    {
        var aggregate = await session.Events.AggregateStreamAsync<AddressCandidate>(id);

        if (aggregate == null) return Results.NotFound();

        var @event = new AddressManuallySelected(id, addressId, DateTime.UtcNow);
        session.Events.Append(id, @event);
        await session.SaveChangesAsync();
        return Results.Ok();
    }

    public static async Task<IResult> RejectAsync(Guid id, IDocumentSession session, IEnumerable<IAddressCandidateRejectedHandler> handlers)
    {
        var events = await session.Events.FetchStreamAsync(id);
        if (events == null || events.Count == 0) return Results.NotFound();

        var @event = new AddressRejected(id, "Rejected by operator", DateTime.UtcNow);
        session.Events.Append(id, @event);
        await session.SaveChangesAsync();

        foreach (var handler in handlers)
        {
            await handler.HandleAsync(@event);
        }

        return Results.Ok();
    }
    public static async Task<IResult> ConfirmAsync(Guid id, IDocumentSession session, IEnumerable<IAddressCandidateConfirmedHandler> handlers)
    {
        var aggregate = await session.Events.AggregateStreamAsync<AddressCandidate>(id);

        if (aggregate == null) return Results.NotFound();

        var @event = new AddressConfirmed(id, DateTime.UtcNow);
        session.Events.Append(id, @event);
        await session.SaveChangesAsync();

        foreach (var handler in handlers)
        {
            await handler.HandleAsync(@event);
        }

        return Results.Ok();
    }
}
