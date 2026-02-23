namespace SistemaRecepcionMP.Application.Common.Interfaces;

public interface IFileStorageService
{
    /// <summary>
    /// Sube un archivo al almacenamiento y devuelve la URL de acceso.
    /// </summary>
    /// <param name="contenido">Bytes del archivo.</param>
    /// <param name="nombreArchivo">Nombre con extensión.</param>
    /// <param name="contenedor">Carpeta o contenedor destino (ej: "facturas", "coas", "fotos").</param>
    /// <param name="cancellationToken"></param>
    Task<string> SubirArchivoAsync(
        byte[] contenido,
        string nombreArchivo,
        string contenedor,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sube un archivo desde un Stream.
    /// </summary>
    Task<string> SubirArchivoStreamAsync(
        Stream stream,
        string nombreArchivo,
        string contenedor,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Elimina un archivo dado su URL.
    /// </summary>
    Task EliminarArchivoAsync(
        string url,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Genera una URL firmada con tiempo de expiración (SAS Token para Azure Blob).
    /// Para file share local devuelve la misma URL.
    /// </summary>
    Task<string> ObtenerUrlFirmadaAsync(
        string url,
        TimeSpan expiracion,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Verifica si un archivo existe en el almacenamiento.
    /// </summary>
    Task<bool> ExisteAsync(
        string url,
        CancellationToken cancellationToken = default);
}