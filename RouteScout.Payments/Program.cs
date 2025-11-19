using JasperFx;
using Marten;
using RouteScout.Payments.Application;
using RouteScout.Payments.Endpoints;
using RouteScout.Payments.Extensions;

var builder = WebApplication.CreateBuilder(args);

// PostgreSQL connection
var connectionString = builder.Configuration.GetConnectionString("PaymentsDb")
    ?? "Host=localhost;Database=payments;Username=postgres;Password=postgres";

builder.Services.AddScoped<PaymentService>();
builder.Services.AddMarten(opts =>
{
    opts.Connection(connectionString);
    opts.AutoCreateSchemaObjects = AutoCreate.All;

    // Event store setup
    opts.Events.DatabaseSchemaName = "payments";

    opts.AddPaymentsEventTypesAndProjections();
}).UseLightweightSessions();

builder.Services.AddAntiforgery();

var app = builder.Build();

app.MapPaymentEndpoints();

app.UseAntiforgery();

app.Run();
