namespace RecepcionMP.Application.DTOs;

public class RecepcionDto
{
    public int Id { get; set; }
    public DateTime FechaRecepcion { get; set; }

    public int OrdenCompraId { get; set; }
    public int FacturaId { get; set; }

    public string PlacaVehiculo { get; set; } = string.Empty;
    public string NombreTransportista { get; set; } = string.Empty;

    public EstadoRecepcion Estado { get; set; }
    
    /// <summary>
    /// Indica si la recepción requiere aprobación de Calidad
    /// </summary>
    public bool RequiereAprobacionCalidad { get; set; }
    
    public List<LoteDto> Lotes { get; set; } = new();
    
}
