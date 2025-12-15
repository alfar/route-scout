using Marten;
using RouteScout.Routes.Domain.Events;

namespace RouteScout.Route
{
    public class StopService : IStopService
    {
        private readonly IDocumentSession _session;

        public StopService(IDocumentSession session)
        {
            _session = session;
        }

        public async Task CreateStop(Guid addressId, Guid streetId, string streetName, string houseNumber, int amount, int sortOrder, Guid areaId, string areaName)
        {
            var stopCreated = new StopCreated(
                Guid.NewGuid(), // StopId
                addressId,
                streetId,
                streetName,
                houseNumber,
                amount,
                sortOrder,
                areaId,
                areaName
            );

            _session.Events.Append(stopCreated.StopId, stopCreated);
            await _session.SaveChangesAsync();
        }
    }
}