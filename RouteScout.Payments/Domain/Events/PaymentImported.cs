namespace RouteScout.Payments.Domain.Events;

public record PaymentImported(
    Guid PaymentId,
    string Message,
    decimal Amount,
    DateTimeOffset Timestamp,
    string CsvLineHash);
