namespace RouteScout.Contracts;

public interface ICurrentUserService
{
    Guid? GetUserId();
    string? GetUserEmail();
    bool IsAuthenticated();
}
