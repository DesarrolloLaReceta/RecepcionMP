

using MediatR;
using SistemaRecepcionMP.Application.Common.Behaviours;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.AgregarFactura;

public sealed class AgregarFacturaCommand : IRequest<Unit>, IAuditableCommand
{
    public Guid RecepcionId { get; set; }

    public string NumeroFactura { get; set; } = string.Empty;
    public DateOnly FechaFactura { get; set; }
    public decimal TotalFactura { get; set; }

    public string Proveedor { get; set; } = string.Empty;

    public string EntidadAfectada => "Factura";
    public string RegistroId => RecepcionId.ToString();
}