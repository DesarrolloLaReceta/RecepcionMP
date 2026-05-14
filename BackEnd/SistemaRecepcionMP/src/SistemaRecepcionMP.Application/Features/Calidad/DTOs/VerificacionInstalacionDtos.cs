namespace SistemaRecepcionMP.Application.Features.Calidad.DTOs;

public sealed class VerificacionInstalacionListItemDto
{
    public Guid Id { get; set; }
    public DateTime Fecha { get; set; }
    public string Zona { get; set; } = string.Empty;
    public string NombreResponsable { get; set; } = string.Empty;
    public string CargoResponsable { get; set; } = string.Empty;
    public decimal CumplimientoTotal { get; set; }
    public bool TieneFallas { get; set; }
}

public sealed class VerificacionInstalacionDetalleDto
{
    public Guid Id { get; set; }
    public DateTime Fecha { get; set; }
    public string Zona { get; set; } = string.Empty;
    public decimal CumplimientoTotal { get; set; }
    public string NombreResponsable { get; set; } = string.Empty;
    public string CargoResponsable { get; set; } = string.Empty;
    public List<VerificacionInstalacionDetalleLineaDto> Detalles { get; set; } = new();
}

public sealed class VerificacionInstalacionDetalleLineaDto
{
    public string AspectoId { get; set; } = string.Empty;
    public string AspectoNombre { get; set; } = string.Empty;
    public short Calificacion { get; set; }
    public string? Hallazgo { get; set; }
    public string? PlanAccion { get; set; }
    public string? Responsable { get; set; }
    public List<string> FotoUrls { get; set; } = new();
}
