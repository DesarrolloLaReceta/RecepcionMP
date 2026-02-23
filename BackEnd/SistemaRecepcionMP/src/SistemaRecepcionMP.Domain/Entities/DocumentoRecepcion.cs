using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Domain.Entities;

public class DocumentoRecepcion : BaseEntity
{
    public Guid? RecepcionId { get; set; }
    public Guid? LoteRecibidoId { get; set; }
    public TipoDocumento TipoDocumento { get; set; }
    public string NombreArchivo { get; set; } = string.Empty;
    public string AdjuntoUrl { get; set; } = string.Empty;
    public Guid? TipoDocumentoExigidoCategoriaId { get; set; }
    public DateTime FechaCarga { get; set; } = DateTime.UtcNow;
    public Guid CargadoPor { get; set; }
    public bool? EsValido { get; set; }
    public string? ObservacionValidacion { get; set; }

    // Navegación
    public Recepcion? Recepcion { get; set; }
    public LoteRecibido? LoteRecibido { get; set; }
    public Usuario UsuarioCargador { get; set; } = null!;
    public TipoDocumentoExigidoCategoria? TipoDocumentoExigidoCategoria { get; set; }
}