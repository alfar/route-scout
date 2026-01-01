using JasperFx;
using Marten;
using Microsoft.AspNetCore.HttpOverrides;
using RouteScout.AddressWashing.Extensions;
using RouteScout.AddressWashing.IntegrationPoints;
using RouteScout.Payments.Endpoints;
using RouteScout.Payments.Extensions;
using RouteScout.Payments.IntegrationPoints;
using RouteScout.Projects.Extensions;
using RouteScout.Routes.Extensions;
using RouteScout.Stream.Extensions;
using RouteScout.StreetCatalog.Extensions;
using RouteScout.StreetCatalog.Services;
using RouteScout.Teams.Extensions;
using RouteScout.Web.Server.Integration.AddressWashing;
using RouteScout.Web.Server.Integration.Payments;
using RouteScout.Web.Server.Authentication;
using RouteScout.Web.Server.Authorization;
using RouteScout.Web.Server.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using RouteScout.Contracts;

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

// Add CORS to allow Vite dev server
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("https://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Add Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
})
.AddCookie(options =>
{
    options.LoginPath = "/auth/login/google";
    options.LogoutPath = "/auth/logout";
    options.Cookie.SameSite = SameSiteMode.None; // Changed from Lax to None for CORS
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Events = new CookieAuthenticationEvents
    {
        OnSigningIn = async context =>
        {
            // Store user ID as a Guid claim
            var claimsIdentity = (ClaimsIdentity)context.Principal!.Identity!;
            var nameIdentifierClaim = claimsIdentity.FindFirst(ClaimTypes.NameIdentifier);
            
            if (nameIdentifierClaim != null)
            {
                // Create a deterministic Guid from the Google user ID
                var googleId = nameIdentifierClaim.Value;
                var userId = GenerateGuidFromString(googleId);
                
                // Replace the NameIdentifier claim with our Guid
                claimsIdentity.RemoveClaim(nameIdentifierClaim);
                claimsIdentity.AddClaim(new Claim(ClaimTypes.NameIdentifier, userId.ToString()));
            }
            
            await Task.CompletedTask;
        }
    };
})
.AddGoogle(options =>
{
    options.ClientId = builder.Configuration["Authentication:Google:ClientId"] 
        ?? throw new InvalidOperationException("Google ClientId not configured");
    options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]
        ?? throw new InvalidOperationException("Google ClientSecret not configured");
    options.SaveTokens = true;
    options.Scope.Add("profile");
    options.Scope.Add("email");
    
    options.ClaimActions.MapJsonKey("picture", "picture");
    
    // Explicitly set the callback path
    options.CallbackPath = "/signin-google";
    
    // Configure events to handle redirects properly
    options.Events.OnRedirectToAuthorizationEndpoint = context =>
    {
        // Ensure the redirect_uri parameter uses the backend URL
        var redirectUri = context.RedirectUri;
        
        // If running behind a proxy (Vite), make sure we use the backend URL
        if (!string.IsNullOrEmpty(context.Request.Headers["X-Forwarded-Host"]))
        {
            var scheme = context.Request.Scheme;
            var host = context.Request.Host.Value;
            
            // Force the backend host/port
            if (host?.Contains("5173") ?? false) // Vite dev server
            {
                host = "localhost:7258";
                scheme = "https";
            }
            
            var callbackPath = options.CallbackPath;
            var newRedirectUri = $"{scheme}://{host}{callbackPath}";
            
            // Replace the redirect_uri in the authorization URL
            redirectUri = redirectUri.Replace(
                Uri.EscapeDataString($"https://localhost:5173{callbackPath}"),
                Uri.EscapeDataString(newRedirectUri)
            );
        }
        
        context.Response.Redirect(redirectUri);
        return Task.CompletedTask;
    };
});

// Add Authorization
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("ProjectOwner", policy =>
        policy.Requirements.Add(new ProjectOwnerRequirement()));

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IAuthorizationHandler, ProjectOwnerAuthorizationHandler>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

// Add services to the container.
builder.Services.AddAddressWashing();
builder.Services.AddPayments();
builder.Services.AddProjects();
builder.Services.AddRoutes();
builder.Services.AddTeams();
builder.Services.AddStream();

builder.Services.AddScoped<IAddressCandidateConfirmedHandler, AddressConfirmedAddStopHandler>();
builder.Services.AddScoped<IAddressCandidateRejectedHandler, AddressRejectedPaymentResetHandler>();
builder.Services.AddScoped<IPaymentConfirmedHandler, PaymentConfirmedAddAddressHandler>();

builder.Services.AddScoped<IStreetCatalogClient, StreetCatalogClient>();

builder.Services.AddMarten(opts =>
{
    opts.Connection(connectionString);
    opts.AutoCreateSchemaObjects = AutoCreate.All;

    // Event store setup
    opts.Events.DatabaseSchemaName = "routescout";

    // Register event types and projections
    opts.AddAddressWashingEventTypesAndProjections();
    opts.AddPaymentsEventTypesAndProjections();
    opts.AddProjectsEventTypesAndProjections();
    opts.AddRoutesEventTypesAndProjections();
    opts.AddTeamsEventTypesAndProjections();

    // Add subscriptions


}).AddStreamSubscriptions()
  .UseLightweightSessions();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

// CORS must come before Authentication
app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

// Authentication endpoints
app.MapAuthenticationEndpoints();

// Nest all API endpoints under /api/projects/{projectId:guid} with ProjectOwner authorization
app.MapGroup("/api/projects/{projectId:guid}")
    .RequireAuthorization("ProjectOwner")
    .MapAddressWashingEndpoints()
    .MapPaymentEndpoints()
    .MapRouteEndpoints()
    .MapTeamEndpoints();

// Project management endpoints (not scoped by projectId)
// StreetCatalog and Stream endpoints don't need project scoping
app.MapGroup("/api")
    .MapProjectEndpoints()
    .MapStreetCatalogEndpoints()
    .MapStreamEndpoints();

// Anonymous team endpoints (no projectId, no auth required)
app.MapGroup("/api/teams")
    .MapAnonymousTeamEndpoints()
    .MapAnonymousRouteEndpoints();

app.MapFallbackToFile("/index.html");

app.Run();

// Helper method to generate deterministic Guid from string
static Guid GenerateGuidFromString(string input)
{
    using var md5 = System.Security.Cryptography.MD5.Create();
    var hash = md5.ComputeHash(System.Text.Encoding.UTF8.GetBytes(input));
    return new Guid(hash);
}
