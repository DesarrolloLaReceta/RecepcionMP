namespace RecepcionMP.Application.DTOs;

public class CreateLoteDto
{
    public int ItemId { get; set; }

    public string NumeroLote { get; set; } = string.Empty;
    public DateTime FechaFabricacion { get; set; }
    public DateTime FechaVencimiento { get; set; }

    public decimal CantidadRecibida { get; set; }
    public string UnidadMedida { get; set; } = string.Empty;
}
