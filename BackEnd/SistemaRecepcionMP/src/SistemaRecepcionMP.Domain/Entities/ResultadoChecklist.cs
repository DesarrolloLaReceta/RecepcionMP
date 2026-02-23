using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Domain.Entities;

public class ResultadoChecklist : BaseEntity
{
    public Guid LoteRecibidoId { get; set; }
    public Guid ChecklistId { get; set; }
    public Guid ItemChecklistId { get; set; }
    public ResultadoItem Resultado { get; set; }
    public string? Observacion { get; set; }
    public Guid RegistradoPor { get; set; }
    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

    // Navegación
    public LoteRecibido LoteRecibido { get; set; } = null!;
    public ChecklistBPM Checklist { get; set; } = null!;
    public ItemChecklist ItemChecklist { get; set; } = null!;
    public Usuario UsuarioRegistrador { get; set; } = null!;
}