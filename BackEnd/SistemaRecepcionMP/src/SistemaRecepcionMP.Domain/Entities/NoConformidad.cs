using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Domain.Entities;

public class NoConformidad : BaseEntity
{
    public string Numero { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public Guid LoteRecibidoId { get; set; }
    public TipoNoConformidad Tipo { get; set; }
    public PrioridadNoConformidad Prioridad { get; set; }
    public Guid CausalId { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public decimal CantidadAfectada { get; set; }
    public EstadoNoConformidad Estado { get; set; } = EstadoNoConformidad.Abierta;
    public string? AsignadoA { get; set; }
    public string? CausaRaiz { get; set; }
    public string? ObservacionesCierre { get; set; }
    public DateOnly? FechaLimite { get; set; }
    public DateTime? FechaCierre { get; set; }
    public Guid CreadoPor { get; set; }
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    // Navegación
    public LoteRecibido LoteRecibido { get; set; } = null!;
    public CausalNoConformidad Causal { get; set; } = null!;
    public Usuario UsuarioCreador { get; set; } = null!;
    public ICollection<AccionCorrectiva> AccionesCorrectivas { get; set; } = new List<AccionCorrectiva>();
    public ICollection<ComentarioNoConformidad> Comentarios { get; set; } = new List<ComentarioNoConformidad>(); // ← agrega
}