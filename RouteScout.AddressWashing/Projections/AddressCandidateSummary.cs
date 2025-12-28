using RouteScout.AddressWashing.Domain;
using RouteScout.AddressWashing.Events;

namespace RouteScout.AddressWashing.Projections
{
    public class AddressCandidateSummary
    {
        public Guid Id { get; set; }
        public Guid ProjectId { get; set; }
        public string RawText { get; set; } = string.Empty;
        public bool IsWashed { get; set; }
        public WashResult? LastWashResult { get; set; }
        public Guid? SelectedWashedAddressId { get; set; }
        public string State { get; set; } = "New"; // New, Washed, Selected, Rejected, GivenUp
        public Guid? PaymentId { get; set; } // Nullable
        public int Amount { get; set; } // Number of trees to be picked up at the address

        public void Apply(AddressAdded @event)
        {
            Id = @event.Id;
            ProjectId = @event.ProjectId;
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
}
