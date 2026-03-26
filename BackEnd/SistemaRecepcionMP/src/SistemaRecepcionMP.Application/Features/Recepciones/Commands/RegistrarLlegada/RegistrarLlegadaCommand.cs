using MediatR;
using SistemaRecepcionMP.Application.Common.Behaviours;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.RegistrarLlegada;

public sealed class RegistrarLlegadaCommand : IRequest<Unit>, IAuditableCommand
{
    public Guid RecepcionId { get; set; }
    public DateOnly FechaRecepcion { get; set; }
    public TimeOnly HoraLlegadaVehiculo { get; set; }
    public string PlacaVehiculo { get; set; } = string.Empty;
    public string NombreTransportista { get; set; } = string.Empty;

    public string EntidadAfectada => "Recepcion";
    public string RegistroId => RecepcionId.ToString();
}