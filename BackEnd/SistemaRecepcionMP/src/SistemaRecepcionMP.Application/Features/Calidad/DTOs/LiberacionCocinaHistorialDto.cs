namespace SistemaRecepcionMP.Application.Features.Calidad.DTOs;

public sealed class LiberacionCocinaHistorialItemDto
{
    public int Id { get; set; }
    public DateTime Fecha { get; set; }
    public string Cocina { get; set; } = string.Empty;
    public string NombreResponsable { get; set; } = string.Empty;
    public bool TieneFallas { get; set; }
}

public sealed class LiberacionCocinaDetalleDto
{
    public int Id { get; set; }
    public DateTime Fecha { get; set; }
    public string Turno { get; set; } = string.Empty;
    public string Cocina { get; set; } = string.Empty;
    public string NombreResponsable { get; set; } = string.Empty;
    public string CargoResponsable { get; set; } = string.Empty;
    public string ObservacionesInspeccion { get; set; } = string.Empty;
    public string ObservacionesGenerales { get; set; } = string.Empty;
    public List<LiberacionCocinaDetalleInspeccionDto> Detalles { get; set; } = new();
}

public sealed class LiberacionCocinaDetalleInspeccionDto
{
    public string Item { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
}
