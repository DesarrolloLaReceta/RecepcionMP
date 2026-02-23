using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.API.Models;

/// <summary>
/// Request model para endpoints que reciben archivos vía multipart/form-data.
/// IFormFile no puede vivir en un Command de MediatR — vive en la capa API.
/// El Controller convierte IFormFile → byte[] antes de construir el Command.
/// </summary>
public sealed class AgregarDocumentoSanitarioRequest
{
    public TipoDocumento TipoDocumento { get; set; }
    public string NumeroDocumento { get; set; } = string.Empty;
    public DateOnly FechaExpedicion { get; set; }
    public DateOnly FechaVencimiento { get; set; }
    public IFormFile Archivo { get; set; } = null!;
}

public sealed class AdjuntarDocumentoRecepcionRequest
{
    public TipoDocumento TipoDocumento { get; set; }
    public IFormFile Archivo { get; set; } = null!;
}