using SistemaRecepcionMP.Domain.ValueObjects;

namespace SistemaRecepcionMP.Domain.Entities;

public class Item : BaseEntity
{
    public string CodigoInterno { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public Guid CategoriaId { get; set; }
    public string UnidadMedida { get; set; } = string.Empty;
    public int VidaUtilDias { get; set; }
    public RangoTemperatura? RangoTemperatura { get; set; }
    public bool RequiereLoteProveedor { get; set; }
    public bool Estado { get; set; } = true;
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    // Navegación
    public CategoriaItem Categoria { get; set; } = null!;
    public ICollection<DetalleOrdenCompra> DetallesOrdenCompra { get; set; } = new List<DetalleOrdenCompra>();
}