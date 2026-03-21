namespace SistemaRecepcionMP.Domain.Entities;

public class ComentarioNoConformidad : BaseEntity
{
    public Guid NoConformidadId { get; set; }
    public string Texto { get; set; } = string.Empty;
    public Guid AutorId { get; set; }
    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

    // Navegación
    public NoConformidad NoConformidad { get; set; } = null!;
    public Usuario Autor { get; set; } = null!;
}