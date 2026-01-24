namespace RecepcionMP.Domain.Entities;

public class OrdenCompraItem
{
    public int Id { get; set; }

    public int OrdenCompraId { get; set; }
    public OrdenCompra OrdenCompra { get; set; } = null!;

    public int ItemId { get; set; }
    public Item Item { get; set; } = null!;

    public decimal CantidadEsperada { get; set; }

    public string UnidadMedida { get; set; } = string.Empty;
}
