using SistemaRecepcionMP.Application.Common.Behaviours;
using SistemaRecepcionMP.Domain.Enums;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.RegistrarInspeccionVehiculo;

public sealed class RegistrarInspeccionVehiculoCommand : IRequest, IAuditableCommand
{
    public Guid RecepcionId { get; set; }
    public decimal? TemperaturaInicial { get; set; }
    public bool TemperaturaDentroRango { get; set; }
    public bool IntegridadEmpaque { get; set; }
    public bool LimpiezaVehiculo { get; set; }
    public bool PresenciaOloresExtranos { get; set; }
    public bool PlagasVisible { get; set; }
    public bool DocumentosTransporteOk { get; set; }
    public string? Observaciones { get; set; }

    // IAuditableCommand
    public string EntidadAfectada => "InspeccionVehiculo";
    public string RegistroId => RecepcionId.ToString();
}