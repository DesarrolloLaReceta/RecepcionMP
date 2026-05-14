namespace SistemaRecepcionMP.Application.Common.Interfaces;

/// <summary>
/// Persiste fotos de evidencias de Calidad en disco (wwwroot/uploads/calidad).
/// Devuelve solo el nombre de archivo generado.
/// </summary>
public interface ICalidadEvidenciaFileStorage
{
    /// <param name="extensionConPunto">Ej: ".jpg" o vacío para usar .bin</param>
    Task<string> GuardarFotoAsync(
        byte[] contenido,
        string extensionConPunto,
        CancellationToken cancellationToken = default);
}
