using RouteScout.Payments.Domain.Events;

namespace RouteScout.Payments.Domain;

public class Payment
{
    public Guid Id { get; private set; }
    public Guid ProjectId { get; private set; }
    public string RawText { get; private set; } = default!;
    public decimal Amount { get; private set; }
    public DateTimeOffset Timestamp { get; private set; }
    public string CsvLineHash { get; private set; } = default!;
    public bool Confirmed { get; private set; }
    public bool Rejected { get; private set; }

    public void Apply(PaymentImported e)
    {
        Id = e.PaymentId;
        ProjectId = e.ProjectId;
        RawText = e.Message;
        Amount = e.Amount;
        Timestamp = e.Timestamp;
        CsvLineHash = e.CsvLineHash;
    }

    public void Apply(PaymentConfirmed e)
    {
        Confirmed = true;
    }

    public void Apply(PaymentRejected e)
    {
        Rejected = true;
    }

    public void Apply(PaymentReset e)
    {
        Confirmed = false;
        Rejected = false;
    }

    // Factory method
    public static IEnumerable<object> ImportTransfer(
        Guid projectId, string rawText, decimal amount, DateTimeOffset timestamp, string csvLineHash)
    {
        yield return new PaymentImported(Guid.NewGuid(), projectId, rawText, amount, timestamp, csvLineHash);
    }

    public IEnumerable<object> Confirm()
    {
        if (Confirmed) yield break;
        yield return new PaymentConfirmed(Id);
    }

    public IEnumerable<object> Reject()
    {
        if (Rejected) yield break;
        yield return new PaymentRejected(Id);
    }
}
