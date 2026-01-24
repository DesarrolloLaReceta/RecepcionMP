namespace RecepcionMP.Domain.Entities;

public class Factura
{
    public int Id { get; set; }
    public string NumeroFactura { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public decimal ValorTotal { get; set; }

    public string RutaArchivo { get; set; } = string.Empty;

    public int OrdenCompraId { get; set; }
    public OrdenCompra OrdenCompra { get; set; } = null!;

    public ICollection<Recepcion> Recepciones { get; set; } = new List<Recepcion>();
}
