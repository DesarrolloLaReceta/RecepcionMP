using SistemaRecepcionMP.Application.Common.Behaviours;
using SistemaRecepcionMP.Domain.Enums;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.AdjuntarDocumento;

public sealed class AdjuntarDocumentoCommand : IRequest<Guid>, IAuditableCommand
{
    public Guid? RecepcionId { get; set; }
    public Guid? LoteRecibidoId { get; set; }
    public TipoDocumento TipoDocumento { get; set; }
    public string NombreArchivo { get; set; } = string.Empty;
    public byte[] ContenidoArchivo { get; set; } = Array.Empty<byte>();

    // IAuditableCommand
    public string EntidadAfectada => "DocumentoRecepcion";
    public string RegistroId => (RecepcionId ?? LoteRecibidoId ?? Guid.Empty).ToString();
}