using JasperFx;
using Marten;
using Microsoft.AspNetCore.HttpOverrides;
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

var isHeroku = !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("DYNO"));

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    if (isHeroku)
    {
        options.KnownIPNetworks.Clear();
        options.KnownProxies.Clear();
    }
});

builder.Services.AddHttpsRedirection(options =>
{
    if (isHeroku)
    {
        options.RedirectStatusCode = StatusCodes.Status308PermanentRedirect;
        options.HttpsPort = 443;
    }
});

// Add services to the container.
builder.Services.AddAddressWashing();
builder.Services.AddIssues();
builder.Services.AddPayments();
builder.Services.AddRoutes();
builder.Services.AddTeams();
builder.Services.AddStream();

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

    // Add subscriptions


}).AddStreamSubscriptions()
  .UseLightweightSessions();

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

app.UseForwardedHeaders();
app.UseHttpsRedirection();

app.UseAuthorization();

app.MapGroup("/api")
    .MapAddressWashingEndpoints()
    .MapIssueEndpoints()
    .MapPaymentEndpoints()
    .MapRouteEndpoints()
    .MapStreetCatalogEndpoints()
    .MapStreamEndpoints()
    .MapTeamEndpoints();

app.MapFallbackToFile("/index.html");

app.Run();
