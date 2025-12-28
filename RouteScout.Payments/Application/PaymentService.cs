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
        public DateTimeOffset Timestamp { get; set; }
        public string Message { get; set; } = "";
        public decimal Amount { get; set; }
    }

    public async Task ImportCsv(Guid projectId, Stream csvStream)
    {
        using var reader = new StreamReader(csvStream);
        using var csv = new CsvHelper.CsvReader(reader, new CsvHelper.Configuration.CsvConfiguration(System.Globalization.CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
            Delimiter = ","
        });

        // Read the first header row (English)
        csv.Read();
        csv.ReadHeader();

        // Read and ignore the second header row (Danish)
        if (csv.Read())
        {
            // Intentionally ignore this row
        }

        // Process remaining records
        while (csv.Read())
        {
            // Extract relevant fields from CSV columns
            var message = csv.GetField("Message") ?? string.Empty;

            // Amount parsing
            decimal amount;
            if (!csv.TryGetField("Amount", out amount))
            {
                var rawAmount = csv.GetField("Amount") ?? "0";
                rawAmount = new string(rawAmount.Where(c => char.IsDigit(c) || c == '.' || c == ',' || c == '-').ToArray());
                // Try with invariant, then with current culture
                if (!decimal.TryParse(rawAmount, System.Globalization.NumberStyles.Number, System.Globalization.CultureInfo.InvariantCulture, out amount))
                {
                    if (!decimal.TryParse(rawAmount, System.Globalization.NumberStyles.Number, System.Globalization.CultureInfo.CurrentCulture, out amount))
                    {
                        // Skip if cannot parse amount
                        continue;
                    }
                }
            }

            // Timestamp parsing
            DateTimeOffset timestamp;
            var tsRaw = csv.GetField("Timestamp") ?? string.Empty;
            if (!DateTimeOffset.TryParse(tsRaw, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.AssumeUniversal | System.Globalization.DateTimeStyles.AdjustToUniversal, out timestamp))
            {
                if (!DateTimeOffset.TryParse(tsRaw, System.Globalization.CultureInfo.CurrentCulture, System.Globalization.DateTimeStyles.AssumeLocal, out timestamp))
                {
                    // Skip if cannot parse timestamp
                    continue;
                }
            }

            var hash = ComputeHash(message, amount, timestamp);

            // Check if this hash already exists (duplicate) - scoped to project
            var duplicate = await _session.Query<PaymentSummary>()
                .FirstOrDefaultAsync(p => p.ProjectId == projectId && p.CsvLineHash == hash);

            if (duplicate is not null)
            {
                var newId = Guid.NewGuid();

                _session.Events.StartStream<Payment>(
                    newId,
                    new PaymentDuplicateDetected(newId, duplicate.Id));
            }
            else
            {
                var events = Payment.ImportTransfer(projectId, message, amount, timestamp, hash);
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
