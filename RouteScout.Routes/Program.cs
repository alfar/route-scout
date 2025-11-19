using JasperFx;
using Marten;
using RouteScout.Routes.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add Marten event store
var connectionString = builder.Configuration.GetConnectionString("PaymentsDb")
    ?? "Host=localhost;Database=payments;Username=postgres;Password=postgres";

builder.Services.AddMarten(opts =>
{
    opts.Connection(connectionString);
    opts.AutoCreateSchemaObjects = AutoCreate.All;

    // Event store setup
    opts.Events.DatabaseSchemaName = "payments";

    opts.AddRoutesEventTypesAndProjections();
}).UseLightweightSessions();

var app = builder.Build();

app.Run();
