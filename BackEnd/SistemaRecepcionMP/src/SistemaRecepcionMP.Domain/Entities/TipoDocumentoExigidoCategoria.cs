using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Domain.Entities;

public class TipoDocumentoExigidoCategoria : BaseEntity
{
    public Guid CategoriaId { get; set; }
    public TipoDocumento TipoDocumento { get; set; }
    public bool EsObligatorio { get; set; }
    public string? Descripcion { get; set; }

    // Navegación
    public CategoriaItem Categoria { get; set; } = null!;
}