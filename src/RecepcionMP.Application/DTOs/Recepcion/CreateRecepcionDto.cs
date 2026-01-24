namespace RecepcionMP.Application.DTOs;

public class CreateRecepcionDto
{
    public int OrdenCompraId { get; set; }
    public int FacturaId { get; set; }

    public DateTime FechaRecepcion { get; set; }

    public string PlacaVehiculo { get; set; } = string.Empty;
    public string NombreTransportista { get; set; } = string.Empty;
    
    /// <summary>
    /// Usuario que crea la recepción (para auditoría y eventos)
    /// </summary>
    public string? UsuarioId { get; set; }

    public List<CreateLoteDto> Lotes { get; set; } = new();
    public List<CreateTemperaturaRecepcionDto> Temperaturas { get; set; } = new();
    public List<CreateCheckListItemDto> ChecklistItems { get; set; } = new();

}
