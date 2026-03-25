using SistemaRecepcionMP.Application.Common.Behaviours;
using SistemaRecepcionMP.Domain.Enums;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.AgregarLoteAItem;

public sealed class AgregarLoteAItemCommand : IRequest<Guid>, IAuditableCommand
{
    public Guid RecepcionId { get; set; }
    public Guid DetalleOcId { get; set; }
    public Guid ItemId { get; set; }
    public string? NumeroLoteProveedor { get; set; }
    public DateOnly? FechaFabricacion { get; set; }
    public DateOnly FechaVencimiento { get; set; }
    public decimal CantidadRecibida { get; set; }
    public string UnidadMedida { get; set; } = string.Empty;
    public decimal? TemperaturaMedida { get; set; }
    public EstadoSensorial EstadoSensorial { get; set; }
    public EstadoRotulado EstadoRotulado { get; set; }
    public UbicacionDestino? UbicacionDestino { get; set; }

    // IAuditableCommand
    public string EntidadAfectada => "LoteRecibido";
    public string RegistroId => RecepcionId.ToString();
}