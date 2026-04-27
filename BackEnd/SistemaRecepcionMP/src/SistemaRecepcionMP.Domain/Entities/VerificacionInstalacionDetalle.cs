namespace SistemaRecepcionMP.Domain.Entities;

public sealed class VerificacionInstalacionDetalle : BaseEntity
{
    public Guid VerificacionInstalacionId { get; private set; }
    public string AspectoId { get; private set; } = string.Empty;
    public string AspectoNombre { get; private set; } = string.Empty;
    public short Calificacion { get; private set; }
    public string? Hallazgo { get; private set; }
    public string? PlanAccion { get; private set; }
    public string? Responsable { get; private set; }
    public string? RutasFotos { get; private set; }

    public VerificacionInstalacion VerificacionInstalacion { get; private set; } = null!;

    private VerificacionInstalacionDetalle() { }

    public VerificacionInstalacionDetalle(
        Guid verificacionInstalacionId,
        string aspectoId,
        string aspectoNombre,
        short calificacion,
        string? hallazgo,
        string? planAccion,
        string? responsable,
        string? rutasFotos)
    {
        VerificacionInstalacionId = verificacionInstalacionId;
        AspectoId = aspectoId;
        AspectoNombre = aspectoNombre;
        Calificacion = calificacion;
        Hallazgo = hallazgo;
        PlanAccion = planAccion;
        Responsable = responsable;
        RutasFotos = rutasFotos;
    }
}

