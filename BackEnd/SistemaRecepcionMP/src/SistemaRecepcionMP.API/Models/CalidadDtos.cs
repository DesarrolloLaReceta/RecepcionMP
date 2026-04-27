namespace SistemaRecepcionMP.API.Models;

public sealed class GuardarVerificacionInstalacionesRequest
{
    public string Zona { get; set; } = string.Empty;
    public decimal CumplimientoTotal { get; set; }
    public string DataJson { get; set; } = string.Empty;
    public string? ObservacionesGenerales { get; set; }
}

public sealed class VerificacionInstalacionPayloadDto
{
    public string Zona { get; set; } = string.Empty;
    public decimal CumplimientoTotal { get; set; }
    public string? ObservacionesGenerales { get; set; }
    public List<VerificacionInstalacionSeccionDto> Secciones { get; set; } = new();
}

public sealed class VerificacionInstalacionSeccionDto
{
    public string Seccion { get; set; } = string.Empty;
    public decimal Cumplimiento { get; set; }
    public List<VerificacionInstalacionFilaDto> Filas { get; set; } = new();
}

public sealed class VerificacionInstalacionFilaDto
{
    public string AspectoId { get; set; } = string.Empty;
    public string Item { get; set; } = string.Empty;
    public short Calificacion { get; set; }
    public string Hallazgos { get; set; } = string.Empty;
    public string PlanAccion { get; set; } = string.Empty;
    public string Responsable { get; set; } = string.Empty;
}
