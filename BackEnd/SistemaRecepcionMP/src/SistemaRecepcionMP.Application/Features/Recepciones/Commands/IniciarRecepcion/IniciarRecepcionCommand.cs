using SistemaRecepcionMP.Application.Common.Behaviours;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.IniciarRecepcion;

public sealed class IniciarRecepcionCommand : IRequest<Guid>, IAuditableCommand
{
    public Guid OrdenCompraId { get; set; }
    public Guid ProveedorId { get; set; }
    public Guid UsuarioId { get; set; }

    public string? ObservacionesGenerales { get; set; }

    // Auditoría
    public string EntidadAfectada => "Recepcion";
    public string RegistroId => OrdenCompraId.ToString();
}