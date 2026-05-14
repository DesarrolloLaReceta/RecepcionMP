namespace SistemaRecepcionMP.Application.Common.Interfaces;

/// <summary>
/// Construye URLs públicas para evidencias almacenadas (nombre de archivo o rutas legadas).
/// </summary>
public interface ICalidadEvidenciaUrlResolver
{
    string? ToPublicFotoUrl(string? valorAlmacenado);

    IReadOnlyList<string> ToPublicFotoUrlsFromJson(string? rutasFotosJson);
}
