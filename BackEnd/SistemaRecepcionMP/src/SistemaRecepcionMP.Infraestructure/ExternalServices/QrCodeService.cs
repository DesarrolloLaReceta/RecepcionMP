using SistemaRecepcionMP.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using QRCoder;

namespace SistemaRecepcionMP.Infrastructure.ExternalServices;

/// <summary>
/// Implementa IQrCodeService usando QRCoder.
/// Requiere el paquete: QRCoder
/// </summary>
public sealed class QrCodeService : IQrCodeService
{
    private readonly IFileStorageService _fileStorage;
    private readonly ILogger<QrCodeService> _logger;

    public QrCodeService(IFileStorageService fileStorage, ILogger<QrCodeService> logger)
    {
        _fileStorage = fileStorage;
        _logger = logger;
    }

    public Task<byte[]> GenerarAsync(string contenido, int tamano = 20,
        CancellationToken cancellationToken = default)
    {
        using var qrGenerator = new QRCodeGenerator();
        using var qrData = qrGenerator.CreateQrCode(contenido, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new PngByteQRCode(qrData);
        var bytes = qrCode.GetGraphic(tamano);
        return Task.FromResult(bytes);
    }

    public async Task<byte[]> GenerarParaLoteAsync(
        string codigoLote,
        string nombreItem,
        string proveedor,
        DateOnly fechaVencimiento,
        string ubicacion,
        CancellationToken cancellationToken = default)
    {
        // Construir contenido del QR con los datos de trazabilidad
        var contenido = $"LOTE:{codigoLote}|ITEM:{nombreItem}|PROV:{proveedor}" +
                        $"|VENCE:{fechaVencimiento:yyyy-MM-dd}|UBK:{ubicacion}";

        var bytes = await GenerarAsync(contenido, cancellationToken: cancellationToken);
        return bytes;
    }

    public async Task<string> GenerarYAlmacenarAsync(
        string contenido,
        string nombreArchivo,
        CancellationToken cancellationToken = default)
    {
        var bytes = await GenerarAsync(contenido, cancellationToken: cancellationToken);
        await _fileStorage.SubirArchivoAsync(bytes, nombreArchivo, "qr-lotes", cancellationToken);
        return nombreArchivo;
    }
}