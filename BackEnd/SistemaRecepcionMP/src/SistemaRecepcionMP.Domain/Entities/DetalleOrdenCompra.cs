namespace SistemaRecepcionMP.Domain.Entities;

public class DetalleOrdenCompra : BaseEntity
{
    public Guid OrdenCompraId { get; set; }
    public Guid ItemId { get; set; }
    public decimal CantidadSolicitada { get; set; }
    public string UnidadMedida { get; set; } = string.Empty;
    public decimal PrecioUnitario { get; set; }
    public decimal CantidadRecibida { get; set; }
    public decimal CantidadRechazada { get; set; }

    // Navegación
    public OrdenCompra OrdenCompra { get; set; } = null!;
    public Item Item { get; set; } = null!;
    public ICollection<LoteRecibido> LotesRecibidos { get; set; } = new List<LoteRecibido>();
}