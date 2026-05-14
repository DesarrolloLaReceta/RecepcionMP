namespace SistemaRecepcionMP.API.Models;

public sealed class GuardarVerificacionInstalacionesRequest
{
    public string Zona { get; set; } = string.Empty;
    public decimal CumplimientoTotal { get; set; }
    public string DataJson { get; set; } = string.Empty;
    public string? ObservacionesGenerales { get; set; }
    /// <summary>Opcional: si se envían por formulario, tienen prioridad sobre el JSON.</summary>
    public string? NombreResponsable { get; set; }
    public string? CargoResponsable { get; set; }
}

public sealed class VerificacionInstalacionPayloadDto
{
    public string Zona { get; set; } = string.Empty;
    public int PeriodoAnio { get; set; }
    public int PeriodoMes { get; set; }
    public decimal CumplimientoTotal { get; set; }
    public string? ObservacionesGenerales { get; set; }
    public string NombreResponsable { get; set; } = string.Empty;
    public string CargoResponsable { get; set; } = string.Empty;
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

public sealed class RegistrarLavadoBotasManosRequest
{
    public DateTime Fecha { get; set; }
    public string Turno { get; set; } = string.Empty;
    public string Piso { get; set; } = string.Empty;
    public string Entrada { get; set; } = string.Empty;
    public int PersonasRevisadas { get; set; }
    public string? Novedades { get; set; }
    public string? Observaciones { get; set; }
    public IFormFile? FotoEvidencia { get; set; }
    public string NombreResponsable { get; set; } = string.Empty;
    public string CargoResponsable { get; set; } = string.Empty;
}
