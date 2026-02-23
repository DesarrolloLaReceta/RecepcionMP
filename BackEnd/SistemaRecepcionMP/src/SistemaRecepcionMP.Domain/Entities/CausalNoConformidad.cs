using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Domain.Entities;

public class CausalNoConformidad : BaseEntity
{
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public TipoAccionCorrectiva TipoAccionSugerida { get; set; }
    public bool Activo { get; set; } = true;

    // Navegación
    public ICollection<NoConformidad> NoConformidades { get; set; } = new List<NoConformidad>();
}