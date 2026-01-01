using System.Security.Claims;
using Marten;
using Microsoft.AspNetCore.Authorization;
using RouteScout.Projects.Projections;

namespace RouteScout.Web.Server.Authorization;

public class ProjectOwnerAuthorizationHandler : AuthorizationHandler<ProjectOwnerRequirement>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IDocumentStore _documentStore;

    public ProjectOwnerAuthorizationHandler(
        IHttpContextAccessor httpContextAccessor,
        IDocumentStore documentStore)
    {
        _httpContextAccessor = httpContextAccessor;
        _documentStore = documentStore;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ProjectOwnerRequirement requirement)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null)
        {
            context.Fail();
            return;
        }

        // Get the user's ID from claims
        var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            context.Fail();
            return;
        }

        // Extract projectId from route data
        if (!httpContext.Request.RouteValues.TryGetValue("projectId", out var projectIdObj) ||
            projectIdObj == null ||
            !Guid.TryParse(projectIdObj.ToString(), out var projectId))
        {
            context.Fail();
            return;
        }

        // Check if user is an owner of the project
        await using var session = _documentStore.QuerySession();
        var project = await session.LoadAsync<ProjectSummary>(projectId);
        
        if (project == null || !project.OwnerIds.Contains(userId))
        {
            context.Fail();
            return;
        }

        context.Succeed(requirement);
    }
}
