namespace RouteScout.Payments.Domain.Events;

public record PaymentImported(
    Guid PaymentId,
    Guid ProjectId,
    string Message,
    decimal Amount,
    DateTimeOffset Timestamp,
    string CsvLineHash);
