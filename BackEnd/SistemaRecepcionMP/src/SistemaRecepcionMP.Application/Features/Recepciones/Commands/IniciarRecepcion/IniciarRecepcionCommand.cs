using SistemaRecepcionMP.Application.Common.Behaviours;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.IniciarRecepcion;

public sealed class IniciarRecepcionCommand : IRequest<Guid>, IAuditableCommand
{
    public Guid OrdenCompraId { get; set; }
    public DateOnly FechaRecepcion { get; set; }
    public TimeOnly HoraLlegadaVehiculo { get; set; }
    public string? PlacaVehiculo { get; set; }
    public string? NombreTransportista { get; set; }
    public string? ObservacionesGenerales { get; set; }

    // IAuditableCommand
    public string EntidadAfectada => "Recepcion";
    public string RegistroId => OrdenCompraId.ToString();
}