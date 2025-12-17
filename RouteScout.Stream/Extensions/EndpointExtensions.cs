using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using RouteScout.Stream.Services;
using System.Text;
using System.Text.Json;

namespace RouteScout.Stream.Extensions;

public static class EndpointExtensions
{
    public static IEndpointRouteBuilder MapStreamEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/stream").WithTags("Stream");

        group.MapGet("", async (HttpContext context, StreamService stream) =>
        {
            context.Response.Headers.Append("Content-Type", "text/event-stream");
            context.Response.Headers.Append("Cache-Control", "no-cache");
            context.Response.Headers.Append("X-Accel-Buffering", "no");

            var response = context.Response;
            var cts = CancellationTokenSource.CreateLinkedTokenSource(context.RequestAborted);

            async Task SendAsync(string eventType, object payload)
            {
                var json = JsonSerializer.Serialize(payload, JsonSerializerOptions.Web);
                var sb = new StringBuilder();
                sb.AppendLine($"event: {eventType}");
                sb.AppendLine($"data: {json}");
                sb.AppendLine();
                await response.WriteAsync(sb.ToString());
                await response.Body.FlushAsync();
            }

            var subId = stream.Subscribe(async (type, payload) =>
            {
                if (!cts.IsCancellationRequested)
                {
                    await SendAsync(type, payload);
                }
            });

            try
            {
                while (!cts.IsCancellationRequested)
                {
                    await Task.Delay(1000, cts.Token);
                }
            }
            catch (TaskCanceledException) { }
            finally
            {
                stream.Unsubscribe(subId);
            }
        });

        return app;
    }
}
