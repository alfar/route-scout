using RouteScout.Stream.Extensions;
using RouteScout.Stream.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<StreamService>();

var app = builder.Build();

app.MapStreamEndpoints();

app.Run();
