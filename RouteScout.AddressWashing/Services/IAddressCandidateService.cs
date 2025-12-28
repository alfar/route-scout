namespace RouteScout.AddressWashing.Services
{
    public interface IAddressCandidateService
    {
        Task<Guid> AddAddressCandidateAsync(string rawAddress, Guid? paymentId, int amount, Guid projectId);
    }
}