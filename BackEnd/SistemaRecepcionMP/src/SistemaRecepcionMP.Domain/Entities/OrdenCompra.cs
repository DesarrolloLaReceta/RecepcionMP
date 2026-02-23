using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Domain.Entities;

public class OrdenCompra : BaseEntity
{
    public string NumeroOC { get; set; } = string.Empty;
    public Guid ProveedorId { get; set; }
    public DateOnly FechaEmision { get; set; }
    public DateOnly? FechaEntregaEsperada { get; set; }
    public EstadoOrdenCompra Estado { get; set; } = EstadoOrdenCompra.Abierta;
    public string? Observaciones { get; set; }
    public Guid CreadoPor { get; set; }
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    // Navegación
    public Proveedor Proveedor { get; set; } = null!;
    public Usuario UsuarioCreador { get; set; } = null!;
    public ICollection<DetalleOrdenCompra> Detalles { get; set; } = new List<DetalleOrdenCompra>();
    public ICollection<Recepcion> Recepciones { get; set; } = new List<Recepcion>();
}