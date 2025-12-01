using Marten;
using RouteScout.AddressWashing.Domain;
using RouteScout.AddressWashing.Events;
using RouteScout.AddressWashing.IntegrationPoints;
using RouteScout.Route;
using RouteScout.StreetCatalog.Services;

namespace RouteScout.Web.Server.Integration.AddressWashing
{
    public class AddressConfirmedAddStopHandler : IAddressCandidateConfirmedHandler
    {
        private readonly IDocumentStore _store;
        private readonly IStopService _stopService;
        private readonly IStreetCatalogClient _catalog;

        public AddressConfirmedAddStopHandler(IDocumentStore store, IStopService stopService, IStreetCatalogClient catalog)
        {
            _store = store;
            _stopService = stopService;
            _catalog = catalog;
        }

        // This method should be called when an AddressRejected event is handled
        public async Task HandleAsync(AddressConfirmed @event)
        {
            using var session = _store.LightweightSession();
            // Load the AddressCandidate aggregate to get PaymentId
            var candidate = await session.Events.AggregateStreamAsync<AddressCandidate>(@event.Id);

            // Create a stop appending a StopCreated event
            if (candidate is null)
                throw new InvalidOperationException($"AddressCandidate with id {@event.Id} not found.");

            // Find the selected washed address in the last washed result
            var selectedAddressId = candidate.SelectedWashedAddressId;
            var lastWashedResult = candidate.LastWashResult;

            if (lastWashedResult is null || lastWashedResult.Resultater is null)
                throw new InvalidOperationException("No washed addresses found for candidate.");

            var selectedAddress = lastWashedResult.Resultater
                .FirstOrDefault(a => a.Id == selectedAddressId);

            if (selectedAddress is null)
                throw new InvalidOperationException($"Selected washed address with id {selectedAddressId} not found.");

            // Calculate sort order using StreetCatalog (lookup by name)
            var street = await _catalog.GetStreetByNameAsync(selectedAddress.Street);
            var segments = street is not null ? await _catalog.GetSegmentsByStreetAsync(street.Id) : Array.Empty<RouteScout.StreetCatalog.Domain.Segment>();
            var area = street is not null ? await _catalog.GetAreaByIdAsync(street.AreaId) : null;

            int houseNumber = ParseHouseNumber(selectedAddress.Number);
            int segmentSort = 0;
            int withinSegment = 0;

            if (segments is not null && street is not null)
            {
                var seg = segments
                    .OrderBy(s => s.SortOrder)
                    .FirstOrDefault(s => houseNumber >= s.StartNumber && houseNumber <= (s.EndNumber == int.MaxValue ? int.MaxValue : s.EndNumber));
                if (seg is not null)
                {
                    segmentSort = seg.SortOrder;
                    withinSegment = seg.Direction == -1 ? (seg.EndNumber == int.MaxValue ? int.MaxValue - houseNumber : seg.EndNumber - houseNumber) : (houseNumber - seg.StartNumber);
                }
            }

            int sortOrder = CombineSort(area?.SortOrder ?? 0, street?.SortOrder ?? 0, segmentSort, withinSegment);

            await _stopService.CreateStop(selectedAddress.Id, selectedAddress.StreetId, selectedAddress.Street, selectedAddress.Number, candidate.Amount, sortOrder);
        }

        private static int ParseHouseNumber(string number)
        {
            // take leading integer part
            var digits = new string(number.TakeWhile(char.IsDigit).ToArray());
            return int.TryParse(digits, out var n) ? n : 0;
        }

        private static int CombineSort(int areaSort, int streetSort, int segmentSort, int withinSegment)
        {
            // base-weights to maintain hierarchy ordering
            const int W1 = 1_000_000;
            const int W2 = 1_000;
            return areaSort * W1 + streetSort * W2 + segmentSort * 10 + withinSegment;
        }
    }
}
