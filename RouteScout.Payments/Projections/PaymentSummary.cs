// Projections/PaymentSummary.cs
using RouteScout.Payments.Domain.Events;

namespace RouteScout.Payments.Projections;

public class PaymentSummary
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string CsvLineHash { get; set; } = "";
    public string Message { get; set; } = "";
    public decimal Amount { get; set; }
    public DateTimeOffset Timestamp { get; set; }
    public bool Confirmed { get; set; }
    public bool Rejected { get; set; }
    public Guid OriginalId { get; set; }

    public void Apply(PaymentImported e)
    {
        Id = e.PaymentId;
        ProjectId = e.ProjectId;
        CsvLineHash = e.CsvLineHash;
        Message = e.Message;
        Amount = e.Amount;
        Timestamp = e.Timestamp;
    }

    public void Apply(PaymentConfirmed e)
    {
        Confirmed = true;
    }
    public void Apply(PaymentRejected e)
    {
        Rejected = true;
    }

    public void Apply(PaymentDuplicateDetected e)
    {
        // Optional: could mark as duplicate or ignore
        OriginalId = e.OriginalPaymentId;
    }

    public void Apply(PaymentReset e)
    {
        Confirmed = false;
        Rejected = false;
    }
}
