using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Domain.Entities;

public class AccionCorrectiva : BaseEntity
{
    public Guid NoConformidadId { get; set; }
    public string DescripcionAccion { get; set; } = string.Empty;
    public Guid ResponsableId { get; set; }
    public DateOnly FechaCompromiso { get; set; }
    public DateOnly? FechaCierre { get; set; }
    public EstadoAccionCorrectiva Estado { get; set; } = EstadoAccionCorrectiva.Pendiente;
    public string? EvidenciaUrl { get; set; }

    // Navegación
    public NoConformidad NoConformidad { get; set; } = null!;
    public Usuario UsuarioResponsable { get; set; } = null!;
}