namespace SistemaRecepcionMP.Domain.Entities;

public class ChecklistBPM : BaseEntity
{
    public Guid CategoriaId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public int Version { get; set; } = 1;
    public bool Estado { get; set; } = true;
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    // Navegación
    public CategoriaItem Categoria { get; set; } = null!;
    public ICollection<ItemChecklist> Items { get; set; } = new List<ItemChecklist>();
    public ICollection<ResultadoChecklist> Resultados { get; set; } = new List<ResultadoChecklist>();
}