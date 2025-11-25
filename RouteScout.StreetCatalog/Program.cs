using JasperFx;
using Marten;
using RouteScout.StreetCatalog.Extensions;
using Weasel.Core;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("StreetCatalogDb")
    ?? "Host=localhost;Database=streets;Username=postgres;Password=postgres";

builder.Services.AddMarten(opts =>
{
    opts.Connection(connectionString);
    opts.AutoCreateSchemaObjects = AutoCreate.CreateOrUpdate;
    opts.Events.DatabaseSchemaName = "streets"; // not using events, but schema name for docs
}).UseLightweightSessions();

var app = builder.Build();

app.MapStreetCatalogEndpoints();

app.Run();
