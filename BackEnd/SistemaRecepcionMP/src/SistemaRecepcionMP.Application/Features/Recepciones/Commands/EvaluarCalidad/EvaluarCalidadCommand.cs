
using MediatR;
using SistemaRecepcionMP.Application.Common.Behaviours;
using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.EvaluarCalidad;

public sealed class EvaluarCalidadCommand : IRequest<Unit>, IAuditableCommand
{
    public Guid RecepcionId { get; set; }
    public Guid LoteId { get; set; }

    public EstadoCalidad EstadoCalidad { get; set; }
    public decimal? CantidadAprobada { get; set; }
    public decimal? CantidadRechazada { get; set; }

    public string? Observaciones { get; set; }

    public string EntidadAfectada => "LoteRecibido";
    public string RegistroId => LoteId.ToString();
}