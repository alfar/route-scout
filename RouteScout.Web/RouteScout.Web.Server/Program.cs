using JasperFx;
using JasperFx.Events.Projections;
using Marten;
using Microsoft.Extensions.Options;
using RouteScout.AddressWashing.Extensions;
using RouteScout.AddressWashing.IntegrationPoints;
using RouteScout.Issues.Extensions;
using RouteScout.Payments.Endpoints;
using RouteScout.Payments.Extensions;
using RouteScout.Payments.IntegrationPoints;
using RouteScout.Routes.Extensions;
using RouteScout.Routes.IntegrationPoints;
using RouteScout.Routes.Integrations;
using RouteScout.Stream.Extensions;
using RouteScout.StreetCatalog.Extensions;
using RouteScout.StreetCatalog.Services;
using RouteScout.Teams.Extensions;
using RouteScout.Web.Server.Integration.AddressWashing;
using RouteScout.Web.Server.Integration.Payments;
using RouteScout.Web.Server.Integration.Routes;

var builder = WebApplication.CreateBuilder(args);

// PostgreSQL connection
var connectionString = builder.Configuration.GetConnectionString("RouteScoutDb")
    ?? "Host=localhost;Database=routescout;Username=postgres;Password=postgres";

// Add services to the container.
builder.Services.AddAddressWashing();
builder.Services.AddIssues();
builder.Services.AddPayments();
builder.Services.AddRoutes();
builder.Services.AddTeams();

builder.Services.AddScoped<IAddressCandidateConfirmedHandler, AddressConfirmedAddStopHandler>();
builder.Services.AddScoped<IAddressCandidateRejectedHandler, AddressRejectedPaymentResetHandler>();
builder.Services.AddScoped<IPaymentConfirmedHandler, PaymentConfirmedAddAddressHandler>();
builder.Services.AddScoped<IStopNotFoundEventHandler, StopNotFoundCreateIssueEventHandler>();
builder.Services.AddScoped<IRouteCutShortEventHandler, RouteCutShortCreateIssueEventHandler>();

builder.Services.AddScoped<IStreetCatalogClient, StreetCatalogClient>();

builder.Services.AddMarten(opts =>
{
    opts.Connection(connectionString);
    opts.AutoCreateSchemaObjects = AutoCreate.All;

    // Event store setup
    opts.Events.DatabaseSchemaName = "routescout";

    // Register event types and projections
    opts.AddAddressWashingEventTypesAndProjections();
    opts.AddIssuesEventTypesAndProjections();
    opts.AddPaymentsEventTypesAndProjections();
    opts.AddRoutesEventTypesAndProjections();
    opts.AddTeamsEventTypesAndProjections();
    opts.AddStreamEventTypesAndProjections();

}).UseLightweightSessions();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapGroup("/api")
    .MapAddressWashingEndpoints()
    .MapIssueEndpoints()
    .MapPaymentEndpoints()
    .MapRouteEndpoints()
    .MapStreetCatalogEndpoints()
    .MapTeamEndpoints();

app.MapFallbackToFile("/index.html");

app.Run();
