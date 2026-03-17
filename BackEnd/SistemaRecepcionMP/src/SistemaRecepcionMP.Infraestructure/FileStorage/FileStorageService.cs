using SistemaRecepcionMP.Application.Common.Interfaces;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace SistemaRecepcionMP.Infrastructure.FileStorage;

/// <summary>
/// Implementa IFileStorageService usando Azure Blob Storage.
/// Requiere el paquete: Azure.Storage.Blobs
/// </summary>
public sealed class AzureBlobStorageService : IFileStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly ILogger<AzureBlobStorageService> _logger;

    public AzureBlobStorageService(
        IConfiguration configuration,
        ILogger<AzureBlobStorageService> logger)
    {
        var connectionString = configuration["AzureStorage:ConnectionString"]
            ?? throw new InvalidOperationException("AzureStorage:ConnectionString no está configurado.");

        _blobServiceClient = new BlobServiceClient(connectionString);
        _logger = logger;
    }

    public async Task<string> SubirArchivoAsync(
        byte[] contenido,
        string nombreArchivo,
        string contenedor,
        CancellationToken cancellationToken = default)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(contenedor);
        await containerClient.CreateIfNotExistsAsync(PublicAccessType.None, cancellationToken: cancellationToken);

        var blobClient = containerClient.GetBlobClient(nombreArchivo);
        using var stream = new MemoryStream(contenido);

        await blobClient.UploadAsync(stream, overwrite: true, cancellationToken);

        _logger.LogInformation("Archivo subido a Azure Blob: {Contenedor}/{Archivo}", contenedor, nombreArchivo);

        return blobClient.Uri.ToString();
    }

    public async Task<string> SubirArchivoStreamAsync(
        Stream stream,
        string nombreArchivo,
        string contenedor,
        CancellationToken cancellationToken = default)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(contenedor);
        await containerClient.CreateIfNotExistsAsync(PublicAccessType.None, cancellationToken: cancellationToken);

        var blobClient = containerClient.GetBlobClient(nombreArchivo);
        await blobClient.UploadAsync(stream, overwrite: true, cancellationToken);

        return blobClient.Uri.ToString();
    }

    public Task EliminarArchivoAsync(
        string url,
        CancellationToken cancellationToken = default)
    {
        var uri = new Uri(url);
        var containerClient = _blobServiceClient.GetBlobContainerClient(uri.Segments[1].TrimEnd('/'));
        var blobClient = containerClient.GetBlobClient(uri.Segments[2].TrimEnd('/'));
        return blobClient.DeleteIfExistsAsync(cancellationToken: cancellationToken);
    }

    public Task<string> ObtenerUrlFirmadaAsync(
        string url,
        TimeSpan expiracion,
        CancellationToken cancellationToken = default)
    {
        var uri = new Uri(url);
        var containerClient = _blobServiceClient.GetBlobContainerClient(uri.Segments[1].TrimEnd('/'));
        var blobClient = containerClient.GetBlobClient(uri.Segments[2].TrimEnd('/'));
        var sas = blobClient.GenerateSasUri(Azure.Storage.Sas.BlobSasPermissions.Read, DateTimeOffset.UtcNow.Add(expiracion)).ToString();
        return Task.FromResult(sas);
    }

    public async Task<bool> ExisteAsync(
        string url,
        CancellationToken cancellationToken = default)
    {
        var uri = new Uri(url);
        var containerClient = _blobServiceClient.GetBlobContainerClient(uri.Segments[1].TrimEnd('/'));
        var blobClient = containerClient.GetBlobClient(uri.Segments[2].TrimEnd('/'));
        var response = await blobClient.ExistsAsync(cancellationToken);
        return response.Value;
    }
}

/// <summary>
/// Implementación local para desarrollo — guarda archivos en disco.
/// Se registra en Development, AzureBlobStorageService en Production.
/// </summary>
public sealed class LocalFileStorageService : IFileStorageService
{
    private readonly string _basePath;
    private readonly ILogger<LocalFileStorageService> _logger;

    public LocalFileStorageService(
        IConfiguration configuration,
        ILogger<LocalFileStorageService> logger)
    {
        _basePath = configuration["LocalStorage:BasePath"]
            ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

        Directory.CreateDirectory(_basePath);
        _logger = logger;
    }

    public async Task<string> SubirArchivoAsync(
        byte[] contenido,
        string nombreArchivo,
        string contenedor,
        CancellationToken cancellationToken = default)
    {
        var rutaCompleta = Path.Combine(_basePath, contenedor, nombreArchivo);
        Directory.CreateDirectory(Path.GetDirectoryName(rutaCompleta)!);
        await File.WriteAllBytesAsync(rutaCompleta, contenido, cancellationToken);

        _logger.LogInformation("Archivo guardado localmente: {Ruta}", rutaCompleta);

        return $"/uploads/{contenedor}/{nombreArchivo}";
    }

    public async Task<string> SubirArchivoStreamAsync(
        Stream stream,
        string nombreArchivo,
        string contenedor,
        CancellationToken cancellationToken = default)
    {
        var rutaCompleta = Path.Combine(_basePath, contenedor, nombreArchivo);
        Directory.CreateDirectory(Path.GetDirectoryName(rutaCompleta)!);

        using var fileStream = File.Create(rutaCompleta);
        await stream.CopyToAsync(fileStream, cancellationToken);

        return $"/uploads/{contenedor}/{nombreArchivo}";
    }

    public Task EliminarArchivoAsync(
        string url,
        CancellationToken cancellationToken = default)
    {
        // url llega como: /uploads/documentos-sanitarios/guid/TipoDoc/guid_filename.pdf
        // _basePath apunta a: wwwroot/uploads
        // Quitamos el prefijo "/uploads/" para obtener la ruta relativa dentro de _basePath
        var relativePath = url.TrimStart('/');
        if (relativePath.StartsWith("uploads/", StringComparison.OrdinalIgnoreCase))
            relativePath = relativePath.Substring("uploads/".Length);

        var rutaCompleta = Path.Combine(_basePath, relativePath.Replace('/', Path.DirectorySeparatorChar));

        if (File.Exists(rutaCompleta))
        {
            File.Delete(rutaCompleta);
            _logger.LogInformation("Archivo eliminado localmente: {Ruta}", rutaCompleta);
        }
        else
        {
            _logger.LogWarning("Archivo no encontrado al intentar eliminar: {Ruta}", rutaCompleta);
        }

        return Task.CompletedTask;
    }

    public Task<string> ObtenerUrlFirmadaAsync(
        string url,
        TimeSpan expiracion,
        CancellationToken cancellationToken = default)
        => Task.FromResult($"/uploads/{url.Split('/')[3]}/{url.Split('/')[4]}");

    public Task<bool> ExisteAsync(
        string url,
        CancellationToken cancellationToken = default)
    {
        var uri = new Uri(url);
        var rutaCompleta = Path.Combine(_basePath, uri.Segments[2].TrimEnd('/'));
        return Task.FromResult(File.Exists(rutaCompleta));
    }
}