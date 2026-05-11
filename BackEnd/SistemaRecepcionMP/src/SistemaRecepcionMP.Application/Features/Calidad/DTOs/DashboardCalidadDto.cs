namespace SistemaRecepcionMP.Application.Features.Calidad.DTOs;

public class DashboardCalidadDto
{
    public int InspeccionesHoy { get; set; }
    public decimal PorcentajeCumplimiento { get; set; }
    public int AlertasCriticas { get; set; }
    public int TurnosPendientes { get; set; }
    public List<NovedadRecienteDto> HistorialNovedades { get; set; } = new();
}

public class NovedadRecienteDto
{
    public string Titulo { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public string Responsable { get; set; } = string.Empty;
    public string TipoFormulario { get; set; } = string.Empty;
}
