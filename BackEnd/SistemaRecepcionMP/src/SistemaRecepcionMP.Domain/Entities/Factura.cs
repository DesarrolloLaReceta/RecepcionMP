namespace SistemaRecepcionMP.Domain.Entities;

public class Factura : BaseEntity
{
    public Guid RecepcionId { get; set; }
    public string NumeroFactura { get; set; } = string.Empty;
    public DateOnly FechaFactura { get; set; }
    public decimal ValorTotal { get; set; }
    public string? AdjuntoUrl { get; set; }
    public string? NotaCreditoNumero { get; set; }
    public decimal? NotaCreditoValor { get; set; }

    // Navegación
    public Recepcion Recepcion { get; set; } = null!;
}