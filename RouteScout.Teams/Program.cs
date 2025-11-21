using JasperFx;
using Marten;
using RouteScout.Teams.Extensions;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("TeamsDb")
    ?? "Host=localhost;Database=routescout;Username=postgres;Password=postgres";

builder.Services.AddTeams();

builder.Services.AddMarten(opts =>
{
    opts.Connection(connectionString);
    opts.AutoCreateSchemaObjects = AutoCreate.All;
    opts.Events.DatabaseSchemaName = "routescout"; // reuse same schema
    opts.AddTeamsEventTypesAndProjections();
}).UseLightweightSessions();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapTeamEndpoints();

app.Run();