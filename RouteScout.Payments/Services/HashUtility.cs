using System.Security.Cryptography;
using System.Text;

namespace RouteScout.Payments.Infrastructure;

public static class HashUtility
{
    /// <summary>
    /// Computes a stable SHA256 hash for a CSV line (or any string).
    /// </summary>
    public static string ComputeCsvLineHash(string csvLine)
    {
        using var sha = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(csvLine.Trim());
        var hash = sha.ComputeHash(bytes);
        return Convert.ToHexString(hash);
    }

    /// <summary>
    /// Optionally use for multi-column CSVs (amount, message, etc.).
    /// </summary>
    public static string ComputeTransferHash(params string[] parts)
    {
        var combined = string.Join("|", parts).Trim();
        return ComputeCsvLineHash(combined);
    }
}
