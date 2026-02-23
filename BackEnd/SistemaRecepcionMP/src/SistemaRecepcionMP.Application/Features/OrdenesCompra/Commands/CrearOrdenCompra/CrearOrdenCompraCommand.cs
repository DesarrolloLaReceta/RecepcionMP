using SistemaRecepcionMP.Application.Common.Behaviours;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.OrdenesCompra.Commands.CrearOrdenCompra;

public sealed class CrearOrdenCompraCommand : IRequest<Guid>, IAuditableCommand
{
    public string NumeroOC { get; set; } = string.Empty;
    public Guid ProveedorId { get; set; }
    public DateOnly FechaEmision { get; set; }
    public DateOnly? FechaEntregaEsperada { get; set; }
    public string? Observaciones { get; set; }
    public List<DetalleOrdenCompraRequest> Detalles { get; set; } = new();

    // IAuditableCommand
    public string EntidadAfectada => "OrdenCompra";
    public string RegistroId => NumeroOC;
}

public sealed class DetalleOrdenCompraRequest
{
    public Guid ItemId { get; set; }
    public decimal CantidadSolicitada { get; set; }
    public string UnidadMedida { get; set; } = string.Empty;
    public decimal PrecioUnitario { get; set; }
}