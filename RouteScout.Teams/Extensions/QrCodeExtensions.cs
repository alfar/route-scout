using QRCoder;
using RouteScout.Teams.Dto;
using RouteScout.Teams.Projections;

namespace RouteScout.Teams.Extensions;

public static class QrCodeExtensions
{
    public static TeamSummaryDto ToDto(this TeamSummary summary, string baseUrl)
    {
        var generator = new QRCodeGenerator();
        var data = generator.CreateQrCode($"{baseUrl}/teams/{summary.Id}", QRCodeGenerator.ECCLevel.Q);
        var pngQr = new PngByteQRCode(data);
        var bytes = pngQr.GetGraphic(10);
        var base64 = Convert.ToBase64String(bytes);
        return new TeamSummaryDto(summary.Id, summary.TrailerSize, summary.LeaderName, summary.LeaderPhone, summary.Members, base64);
    }
}
