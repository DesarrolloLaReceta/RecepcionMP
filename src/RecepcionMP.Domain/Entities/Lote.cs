using RecepcionMP.Domain.Entities;

public class Lote
{
    public int Id { get; set; }

    public int RecepcionId { get; set; }
    public Recepcion Recepcion { get; set; } = null!;

    public int ItemId { get; set; }
    public Item Item { get; set; } = null!;

    public string NumeroLote { get; set; } = string.Empty;
    public DateTime FechaFabricacion { get; set; }
    public DateTime FechaVencimiento { get; set; }
    public decimal CantidadRecibida { get; set; }
    public string UnidadMedida { get; set; } = string.Empty;

    public bool LiberadoCalidad { get; set; }

    // FASE 3 - Relaciones con calidad
    public ICollection<NoConformidad> NoConformidades { get; set; } = new List<NoConformidad>();
    public LiberacionLote? Liberacion { get; set; }
}
