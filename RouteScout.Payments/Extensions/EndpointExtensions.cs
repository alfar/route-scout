using Marten;
using RouteScout.Payments.Application;
using RouteScout.Payments.Domain;
using RouteScout.Payments.IntegrationPoints;
using RouteScout.Payments.Projections;

namespace RouteScout.Payments.Endpoints;
public static class EndpointExtensions
{
    public static IEndpointRouteBuilder MapPaymentEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/payments/import", async (HttpRequest request, PaymentService service) =>
        {
            var file = request.Form.Files.GetFile("file");
            if (file is null)
                return Results.BadRequest("No file uploaded");

            await using var stream = file.OpenReadStream();
            await service.ImportCsv(stream);
            return Results.Ok("CSV processed");
        });

        app.MapPost("/payments/{id}/confirm", async (Guid id, IDocumentSession session, IEnumerable<IPaymentConfirmedHandler> paymentConfirmedHandlers) =>
        {
            var payment = await session.Events.AggregateStreamAsync<Payment>(id);
            if (payment is null)
                return Results.NotFound("Payment not found");

            if (payment.Confirmed)
                return Results.BadRequest("Payment already confirmed");

            session.Events.Append(id, payment.Confirm());
            await session.SaveChangesAsync();

            foreach (var handler in paymentConfirmedHandlers)
            {
                await handler.HandleAsync(id);
            }

            return Results.Ok("Payment confirmed");
        });

        app.MapPost("/payments/{id}/reject", async (Guid id, IDocumentSession session) =>
        {
            var payment = await session.Events.AggregateStreamAsync<Payment>(id);
            if (payment is null)
                return Results.NotFound("Payment not found");

            if (payment.Rejected)
                return Results.BadRequest("Payment already rejected");

            session.Events.Append(id, payment.Reject());
            await session.SaveChangesAsync();

            return Results.Ok("Payment rejected");
        });

        app.MapGet("/payments", async (IDocumentSession session) =>
        {
            var payments = await session.Query<PaymentSummary>().Where(p => !p.Confirmed && !p.Rejected && p.OriginalId == Guid.Empty).ToListAsync();
            return Results.Ok(payments);
        });

        return app;
    }
}
