using SistemaRecepcionMP.Application.Common.Behaviours;
using SistemaRecepcionMP.Domain.Enums;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Proveedores.Commands.AgregarDocumentoSanitario;

public sealed class AgregarDocumentoSanitarioCommand : IRequest<Guid>, IAuditableCommand
{
    public Guid ProveedorId { get; set; }
    public TipoDocumento TipoDocumento { get; set; }
    public string NumeroDocumento { get; set; } = string.Empty;
    public DateOnly FechaExpedicion { get; set; }
    public DateOnly FechaVencimiento { get; set; }

    // Archivo adjunto
    public string NombreArchivo { get; set; } = string.Empty;
    public byte[] ContenidoArchivo { get; set; } = Array.Empty<byte>();

    // IAuditableCommand
    public string EntidadAfectada => "DocumentoSanitarioProveedor";
    public string RegistroId => ProveedorId.ToString();
}