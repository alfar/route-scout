using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;

namespace RouteScout.Web.Server.Authentication;

public static class AuthenticationEndpoints
{
    public static IEndpointRouteBuilder MapAuthenticationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/auth").WithTags("Authentication");

        group.MapGet("/login/google", (HttpContext context, string? returnUrl) =>
        {
            // Get the backend URL scheme and host
            var request = context.Request;
            var scheme = request.Scheme;
            var host = request.Host.Value;
            
            // Build the absolute callback URL pointing to the backend
            var callbackUrl = $"{scheme}://{host}/signin-google";
            
            var properties = new AuthenticationProperties
            {
                RedirectUri = returnUrl ?? "/",
                Items = { { "scheme", GoogleDefaults.AuthenticationScheme } }
            };
            
            return Results.Challenge(properties, new[] { GoogleDefaults.AuthenticationScheme });
        }).AllowAnonymous();

        group.MapPost("/logout", async (HttpContext context, string? returnUrl) =>
        {
            await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            
            if (!string.IsNullOrEmpty(returnUrl))
            {
                return Results.Redirect(returnUrl);
            }
            
            return Results.Ok(new { message = "Logged out successfully" });
        }).AllowAnonymous();

        group.MapGet("/user", (HttpContext context) =>
        {
            // Check if user is authenticated
            if (!context.User.Identity?.IsAuthenticated ?? true)
            {
                return Results.Unauthorized();
            }

            var user = context.User;
            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = user.FindFirst(ClaimTypes.Email)?.Value;
            var name = user.FindFirst(ClaimTypes.Name)?.Value;
            var picture = user.FindFirst("picture")?.Value;

            return Results.Ok(new
            {
                id = userId,
                email = email,
                name = name,
                picture = picture,
                isAuthenticated = true
            });
        }).AllowAnonymous();

        return app;
    }
}
