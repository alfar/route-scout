using RouteScout.AddressWashing.Events;
using RouteScout.Payments.Domain.Events;

namespace RouteScout.ReadModels.Projections;

public class ProcessingQueueItem
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string RawText { get; set; } = string.Empty;
    public decimal PaymentAmount { get; set; }
    public DateTimeOffset PaymentTimestamp { get; set; }

    public Guid? CandidateId { get; set; }
    public string? CandidateState { get; set; }

    public int? Amount { get; set; }
    public bool? IsWashed { get; set; }
    public object? WashResult { get; set; }
    public Guid? SelectedAddressId { get; set; }
    public DateTime? CompletedAt { get; set; }

    public void Apply(PaymentImported e)
    {
        Id = e.PaymentId;
        ProjectId = e.ProjectId;
        RawText = e.Message;
        PaymentAmount = e.Amount;
        PaymentTimestamp = e.Timestamp;
        CandidateState = "New";
    }

    public void Apply(PaymentConfirmed e)
    {
        CandidateState = "PaymentConfirmed";
    }
    public void Apply(PaymentRejected e)
    {
        CandidateState = "PaymentRejected";
    }

    public void Apply(PaymentDuplicateDetected e)
    {
        CandidateState = "PaymentDuplicateDetected";
    }

    public void Apply(PaymentReset e)
    {
        CandidateState = "New";
    }

    public void Apply(AddressAdded e)
    {
        CandidateId = e.Id;
        Amount = e.Amount;
    }

    public void Apply(AddressWashed e)
    {
        IsWashed = true;
        WashResult = e.Result;
        CandidateState = "Washed";
    }

    public void Apply(AddressPreselected e)
    {
        SelectedAddressId = e.WashedAddressId;
        CandidateState = "Selected";
    }

    public void Apply(AddressManuallySelected e)
    {
        SelectedAddressId = e.WashedAddressId;
        CandidateState = "Selected";
    }

    public void Apply(AddressRejected e)
    {
        SelectedAddressId = null;
        CandidateState = "Rejected";
    }

    public void Apply(AddressConfirmed e)
    {
        CandidateState = "Confirmed";
    }
}

