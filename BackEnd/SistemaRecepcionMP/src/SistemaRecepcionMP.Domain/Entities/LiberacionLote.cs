using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Domain.Entities;

public class LiberacionLote : BaseEntity
{
    public Guid LoteRecibidoId { get; set; }
    public DecisionLiberacion Decision { get; set; }
    public string? Observaciones { get; set; }
    public Guid LiberadoPor { get; set; }
    public DateTime FechaLiberacion { get; set; } = DateTime.UtcNow;

    // Navegación
    public LoteRecibido LoteRecibido { get; set; } = null!;
    public Usuario UsuarioCalidad { get; set; } = null!;
}