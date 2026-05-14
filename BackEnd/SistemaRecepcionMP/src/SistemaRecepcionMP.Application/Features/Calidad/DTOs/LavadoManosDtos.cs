namespace SistemaRecepcionMP.Application.Features.Calidad.DTOs;

public sealed class LavadoManosListItemDto
{
    public Guid Id { get; set; }
    public DateTime Fecha { get; set; }
    public string Turno { get; set; } = string.Empty;
    public string NombreResponsable { get; set; } = string.Empty;
    public bool TieneFallas { get; set; }
}

public sealed class LavadoManosDetalleDto
{
    public Guid Id { get; set; }
    public DateTime Fecha { get; set; }
    public string Turno { get; set; } = string.Empty;
    public string Piso { get; set; } = string.Empty;
    public string Entrada { get; set; } = string.Empty;
    public int PersonasRevisadas { get; set; }
    public string? Novedades { get; set; }
    public string? Observaciones { get; set; }
    public string NombreResponsable { get; set; } = string.Empty;
    public string CargoResponsable { get; set; } = string.Empty;
    /// <summary>URL absoluta o null si no hay foto.</summary>
    public string? FotoUrl { get; set; }
}
