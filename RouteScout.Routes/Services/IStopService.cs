namespace RouteScout.Route
{
    public interface IStopService
    {
        Task CreateStop(Guid addressId, Guid streetId, string streetName, string houseNumber, int amount, int sortOrder);
    }
}