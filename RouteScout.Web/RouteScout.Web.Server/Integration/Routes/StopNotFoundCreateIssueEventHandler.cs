using Marten;
using RouteScout.Issues.Services;
using RouteScout.Routes.Domain.Events;
using RouteScout.Routes.Integrations;
using RouteScout.Routes.Projections;
using RouteScout.Teams.Projections;

namespace RouteScout.Web.Server.Integration.Routes
{
    public class StopNotFoundCreateIssueEventHandler : IStopNotFoundEventHandler
    {
        private readonly IIssueService _issueService;
        private readonly IQuerySession _querySession;

        public StopNotFoundCreateIssueEventHandler(IIssueService issueService, IQuerySession querySession)
        {
            _issueService = issueService;
            _querySession = querySession;
        }

        public async Task HandleAsync(StopNotFound @event)
        {
            var stop = await _querySession.Query<StopSummary>().Where(s => s.Id == @event.StopId).FirstOrDefaultAsync();
            var route = await _querySession.Query<RouteSummary>().Where(r => r.Id == stop.RouteId).FirstOrDefaultAsync();
            var team = await _querySession.Query<TeamSummary>().Where(t => t.Id == route.TeamId).FirstOrDefaultAsync();

            await _issueService.CreateIssue("StopNotFound", $"{team.Name} kunne ikke finde {stop.Amount} træer på {stop.StreetName} {stop.HouseNumber} ({route.Name})");
        }
    }
}
