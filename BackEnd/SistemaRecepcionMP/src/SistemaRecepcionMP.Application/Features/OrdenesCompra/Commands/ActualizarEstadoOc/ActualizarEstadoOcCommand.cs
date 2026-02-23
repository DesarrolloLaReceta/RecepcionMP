using SistemaRecepcionMP.Application.Common.Behaviours;
using SistemaRecepcionMP.Domain.Enums;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.OrdenesCompra.Commands.ActualizarEstadoOC;

public sealed class ActualizarEstadoOCCommand : IRequest, IAuditableCommand
{
    public Guid Id { get; set; }
    public EstadoOrdenCompra NuevoEstado { get; set; }
    public string? Motivo { get; set; }

    // IAuditableCommand
    public string EntidadAfectada => "OrdenCompra";
    public string RegistroId => Id.ToString();
}