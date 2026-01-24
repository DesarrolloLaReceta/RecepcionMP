namespace RecepcionMP.Domain.Entities;

public class OrdenCompra
{
    public int Id { get; set; }

    public string NumeroOrden { get; set; } = string.Empty;

    public DateTime FechaOrden { get; set; }

    public int ProveedorId { get; set; }
    public Proveedor Proveedor { get; set; } = null!;

    public EstadoOrdenCompra Estado { get; set; } = EstadoOrdenCompra.Abierta;

    public ICollection<OrdenCompraItem> Items { get; set; }
        = new List<OrdenCompraItem>();
}
