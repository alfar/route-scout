using RouteScout.AddressWashing.Events;

namespace RouteScout.AddressWashing.Domain;

public class AddressCandidate
{
    public Guid Id { get; private set; }
    public string RawText { get; private set; } = string.Empty;
    public bool IsWashed { get; private set; }
    public WashResult? LastWashResult { get; private set; }
    public Guid? SelectedWashedAddressId { get; private set; }
    public string State { get; private set; } = "New"; // New, Washed, Selected, Rejected, GivenUp
    public Guid? PaymentId { get; private set; } // Nullable
    /// <summary>
    /// Number of trees to be picked up at the address.
    /// </summary>
    public int Amount { get; set; }

    public AddressCandidate() { }

    public AddressCandidate(Guid id, string rawText, Guid? paymentId, int amount)
    {
        var @event = new AddressAdded(id, rawText, DateTime.UtcNow, paymentId, amount);
        Apply(@event);
    }

    public void Apply(AddressAdded @event)
    {
        Id = @event.Id;
        RawText = @event.RawText;
        State = "New";
        PaymentId = @event.PaymentId;
        Amount = @event.Amount;
    }

    public void Apply(AddressWashed @event)
    {
        IsWashed = true;
        LastWashResult = @event.Result;
        State = "Washed";
    }

    public void Apply(AddressPreselected @event)
    {
        SelectedWashedAddressId = @event.WashedAddressId;
        State = "Selected";
    }

    public void Apply(AddressManuallySelected @event)
    {
        SelectedWashedAddressId = @event.WashedAddressId;
        State = "Selected";
    }

    public void Apply(AddressRejected @event)
    {
        SelectedWashedAddressId = null;
        State = "Rejected";
    }

    public void Apply(AddressConfirmed @event)
    {
        State = "Confirmed";
    }
}
