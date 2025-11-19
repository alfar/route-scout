using JasperFx;
using Marten;
using RouteScout.AddressWashing.Extensions;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("AddressWashingDb")
    ?? "Host=localhost;Database=payments;Username=postgres;Password=postgres";

// Configure Marten
builder.Services.AddMarten(options =>
{
    // TODO: replace with your connection string
    options.Connection(connectionString);
    // Use event store
    options.AddAddressWashingEventTypesAndProjections();

    // Optionally enable the tenancy/schema generation for development
    options.AutoCreateSchemaObjects = AutoCreate.All;
}).UseLightweightSessions();

builder.Services.AddAddressWashing();

var app = builder.Build();

app.MapAddressWashingEndpoints();
app.Run();



