namespace SistemaRecepcionMP.Domain.Entities;

public class Cuarentena : BaseEntity
{
    public Guid LoteRecibidoId { get; set; }
    public DateOnly FechaCuarentena { get; set; }
    public DateOnly? FechaLiberacion { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public Guid SeguidoPor { get; set; }
    public string? AccionesRealizadas { get; set; }   // qué se hizo durante la cuarentena
    public DecisionCuarentena? Decision { get; set; } // cómo se resolvió

    // Navegación
    public LoteRecibido LoteRecibido { get; set; } = null!;
    public Usuario UsuarioCalidad { get; set; } = null!;
}