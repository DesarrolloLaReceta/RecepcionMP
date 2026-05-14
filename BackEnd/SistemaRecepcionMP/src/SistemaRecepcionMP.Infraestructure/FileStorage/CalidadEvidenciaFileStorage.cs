using SistemaRecepcionMP.Application.Common.Interfaces;
using Microsoft.Extensions.Hosting;

namespace SistemaRecepcionMP.Infrastructure.FileStorage;

public sealed class CalidadEvidenciaFileStorage : ICalidadEvidenciaFileStorage
{
    private readonly IHostEnvironment _environment;

    public CalidadEvidenciaFileStorage(IHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<string> GuardarFotoAsync(
        byte[] contenido,
        string extensionConPunto,
        CancellationToken cancellationToken = default)
    {
        var webRoot = Path.Combine(_environment.ContentRootPath, "wwwroot");
        var dir = Path.Combine(webRoot, "uploads", "calidad");
        Directory.CreateDirectory(dir);

        var ext = string.IsNullOrWhiteSpace(extensionConPunto)
            ? ".bin"
            : extensionConPunto.StartsWith(".", StringComparison.Ordinal)
                ? extensionConPunto
                : "." + extensionConPunto;

        var nombre = $"{Guid.NewGuid()}{ext}";
        var ruta = Path.Combine(dir, nombre);
        await File.WriteAllBytesAsync(ruta, contenido, cancellationToken);
        return nombre;
    }
}
