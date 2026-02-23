namespace SistemaRecepcionMP.Domain.Entities;

public class ItemChecklist : BaseEntity
{
    public Guid ChecklistId { get; set; }
    public string Criterio { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public bool EsCritico { get; set; }
    public int Orden { get; set; }

    // Navegación
    public ChecklistBPM Checklist { get; set; } = null!;
    public ICollection<ResultadoChecklist> Resultados { get; set; } = new List<ResultadoChecklist>();
}