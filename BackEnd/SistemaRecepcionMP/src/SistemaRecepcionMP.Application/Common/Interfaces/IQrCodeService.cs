namespace SistemaRecepcionMP.Application.Common.Interfaces;

public interface IQrCodeService
{
    /// <summary>
    /// Genera un código QR a partir de un texto o URL y devuelve la imagen en bytes PNG.
    /// </summary>
    /// <param name="contenido">Texto, URL o datos a codificar en el QR.</param>
    /// <param name="tamanoPx">Tamaño en píxeles del QR generado (por defecto 300px).</param>
    Task<byte[]> GenerarAsync(
        string contenido,
        int tamanoPx = 300,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Genera un código QR específico para un lote con sus datos de trazabilidad.
    /// El contenido incluye: código interno, ítem, proveedor, vencimiento y ubicación.
    /// </summary>
    Task<byte[]> GenerarParaLoteAsync(
        string codigoLoteInterno,
        string nombreItem,
        string nombreProveedor,
        DateOnly fechaVencimiento,
        string ubicacionDestino,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Genera el código QR y lo sube al almacenamiento, devolviendo la URL.
    /// Combina IQrCodeService + IFileStorageService en un solo paso de alto nivel.
    /// </summary>
    Task<string> GenerarYAlmacenarAsync(
        string contenido,
        string nombreArchivo,
        CancellationToken cancellationToken = default);
}