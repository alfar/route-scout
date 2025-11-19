using Marten;
using RouteScout.Payments.Domain;
using RouteScout.Payments.Domain.Events;
using RouteScout.Payments.Projections;
using System.Security.Cryptography;
using System.Text;

namespace RouteScout.Payments.Application;

public class PaymentService
{
    private readonly IDocumentSession _session;

    public PaymentService(IDocumentSession session)
    {
        _session = session;
    }

    public class BankRows
    {
        public DateTimeOffset Date { get; set; }
        public string Text { get; set; } = "";
        public decimal Amount { get; set; }
    }

    public async Task ImportCsv(Stream csvStream)
    {
        using var reader = new StreamReader(csvStream);
        using var csv = new CsvHelper.CsvReader(reader, new CsvHelper.Configuration.CsvConfiguration(System.Globalization.CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
            Delimiter = ";" 
        });

        var records = csv.GetRecords<BankRows>().ToList();

        foreach (var record in records)
        {
            // Extract relevant fields from CSV columns (you’ll adjust this for your bank’s format)
            string text = record.Text ?? "";
            decimal amount = record.Amount;
            DateTimeOffset timestamp = record.Date;

            var hash = ComputeHash(text, amount, timestamp);

            // Check if this hash already exists (duplicate)
            var duplicate = await _session.Query<PaymentSummary>()
                .FirstOrDefaultAsync(p => p.CsvLineHash == hash);

            if (duplicate is not null)
            {
                var newId = Guid.NewGuid();

                _session.Events.StartStream<Payment>(
                    newId,
                    new PaymentDuplicateDetected(newId, duplicate.Id));
            }
            else
            {
                var events = Payment.ImportTransfer(text, amount, timestamp, hash);
                _session.Events.StartStream<Payment>(Guid.NewGuid(), events.ToArray());
            }
        }

        await _session.SaveChangesAsync();
    }

    private static string ComputeHash(string text, decimal amount, DateTimeOffset timestamp)
    {
        var input = $"{text}|{amount}|{timestamp:O}".Trim().ToLowerInvariant();
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes);
    }
}
