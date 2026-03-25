

using MediatR;
using SistemaRecepcionMP.Application.Common.Behaviours;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.FinalizarRecepcion;

public sealed class FinalizarRecepcionCommand : IRequest<Unit>, IAuditableCommand
{
    public Guid RecepcionId { get; set; }

    // Auditoría
    public string EntidadAfectada => "Recepcion";
    public string RegistroId => RecepcionId.ToString();
}