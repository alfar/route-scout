using JasperFx;
using Marten;
using RouteScout.Issues.Extensions;
using Weasel.Core;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("IssuesDb")
    ?? "Host=localhost;Database=issues;Username=postgres;Password=postgres";

builder.Services.AddMarten(opts =>
{
    opts.Connection(connectionString);
    opts.AutoCreateSchemaObjects = AutoCreate.All;
    opts.Events.DatabaseSchemaName = "issues";
    opts.AddIssuesEventTypesAndProjections();
}).UseLightweightSessions();

builder.Services.AddIssues();

var app = builder.Build();

app.MapIssueEndpoints();

app.Run();
