using MediatR;
using SistemaRecepcionMP.Application.Common.Behaviours;

namespace SistemaRecepcionMP.Application.Features.Calidad.Commands.RegistrarVerificacionInstalacion;

public sealed class RegistrarVerificacionInstalacionCommand : IRequest<Guid>, IAuditableCommand
{
    public string Zona { get; set; } = string.Empty;
    /// <summary>Primer día del mes de inspección (solo mes/año en UI).</summary>
    public DateTime FechaPeriodo { get; set; }
    public decimal CumplimientoTotal { get; set; }
    public string? ObservacionesGenerales { get; set; }
    public string NombreResponsable { get; set; } = string.Empty;
    public string CargoResponsable { get; set; } = string.Empty;
    public List<RegistrarVerificacionInstalacionDetalleDto> Detalles { get; set; } = new();

    public string EntidadAfectada => "VerificacionInstalacion";
    public string RegistroId => Zona;
}

public sealed class RegistrarVerificacionInstalacionDetalleDto
{
    public string AspectoId { get; set; } = string.Empty;
    public string AspectoNombre { get; set; } = string.Empty;
    public short Calificacion { get; set; }
    public string? Hallazgo { get; set; }
    public string? PlanAccion { get; set; }
    public string? Responsable { get; set; }
    public List<RegistrarVerificacionInstalacionFotoDto> Fotos { get; set; } = new();
}

public sealed class RegistrarVerificacionInstalacionFotoDto
{
    public string NombreArchivo { get; set; } = string.Empty;
    public byte[] Contenido { get; set; } = Array.Empty<byte>();
    public string? TipoContenido { get; set; }
}

