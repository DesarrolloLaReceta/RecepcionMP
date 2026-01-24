public class LoteDto
{
    public int ItemId { get; set; }
    public string ItemNombre { get; set; } = string.Empty;
    public string NumeroLote { get; set; } = string.Empty;
    public DateTime FechaFabricacion { get; set; }
    public DateTime FechaVencimiento { get; set; }
    public decimal CantidadRecibida { get; set; }
    public string UnidadMedida { get; set; } = string.Empty;
    public bool LiberadoCalidad { get; set; }
}
