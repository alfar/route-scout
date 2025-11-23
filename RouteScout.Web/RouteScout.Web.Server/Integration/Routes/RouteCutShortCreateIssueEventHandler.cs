using Marten;
using RouteScout.Issues.Services;
using RouteScout.Routes.Domain.Events;
using RouteScout.Routes.IntegrationPoints;
using RouteScout.Routes.Projections;
using RouteScout.Teams.Projections;

namespace RouteScout.Web.Server.Integration.Routes
{
    public class RouteCutShortCreateIssueEventHandler : IRouteCutShortEventHandler
    {
        private readonly IIssueService _issueService;
        private readonly IQuerySession _querySession;

        public RouteCutShortCreateIssueEventHandler(IIssueService issueService, IQuerySession querySession)
        {
            _issueService = issueService;
            _querySession = querySession;
        }

        public async Task HandleAsync(RouteCutShort @event)
        {
            var route = await _querySession.Query<RouteSummary>().Where(r => r.Id == @event.RouteId).FirstOrDefaultAsync();
            var team = await _querySession.Query<TeamSummary>().Where(t => t.Id == route.TeamId).FirstOrDefaultAsync();

            await _issueService.CreateIssue("RouteCutShort", $"{team.Name} afslutter rute {route.Name} med uafhentede træer");
        }
    }
}
