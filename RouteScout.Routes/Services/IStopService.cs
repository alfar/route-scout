namespace RouteScout.Route
{
    public interface IStopService
    {
        Task CreateStop(Guid projectId, Guid addressId, Guid streetId, string streetName, string houseNumber, int amount, int sortOrder, Guid areaId, string areaName, double? latitude, double? longitude);
    }
}