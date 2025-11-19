using Marten;
using RouteScout.AddressWashing.Events;
using System.Threading.Channels;

namespace RouteScout.AddressWashing.Services;

public class BackgroundAddressWashingService : BackgroundService
{
    private readonly Channel<(Guid Id, string RawAddress)> _channel;
    private readonly IServiceProvider _serviceProvider;

    public BackgroundAddressWashingService(Channel<(Guid Id, string RawAddress)> channel, IServiceProvider serviceProvider)
    {
        _channel = channel;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var scope = _serviceProvider.CreateScope();

        var session = scope.ServiceProvider.GetRequiredService<IDocumentSession>();
        var washer = scope.ServiceProvider.GetRequiredService<IAddressWashingService>();

        await foreach (var (id, rawAddress) in _channel.Reader.ReadAllAsync(stoppingToken))
        {
            try
            {
                var wash = await washer.WashAddressAsync(rawAddress);
                var washEvent = new AddressWashed(id, wash, DateTime.UtcNow);
                session.Events.Append(id, washEvent);

                // Auto-preselect if kategori A or B and exactly one result
                if ((wash.Kategori == "A" || wash.Kategori == "B") && wash.Resultater.Count == 1)
                {
                    var single = wash.Resultater.First();
                    var pre = new AddressPreselected(id, single.Id, DateTime.UtcNow);
                    session.Events.Append(id, pre);
                }

                await session.SaveChangesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                // Log the exception (use a logging framework)
                Console.WriteLine($"Error processing address washing for ID {id}: {ex.Message}");
            }
        }
    }
}
