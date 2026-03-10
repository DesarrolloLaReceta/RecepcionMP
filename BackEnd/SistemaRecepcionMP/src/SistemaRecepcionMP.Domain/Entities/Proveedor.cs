using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Domain.Entities;


public class Proveedor : BaseEntity
{
    public string RazonSocial { get; set; } = string.Empty;
    public string Nit { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string? EmailContacto { get; set; }
    public string? Direccion { get; set; }
    public EstadoProveedor Estado { get; set; } = EstadoProveedor.Activo;
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;
    public DateTime? ActualizadoEn { get; set; }

    // Navegación
    public ICollection<ContactoProveedor> Contactos { get; set; } = new List<ContactoProveedor>();
    public ICollection<DocumentoSanitarioProveedor> DocumentosSanitarios { get; set; } = new List<DocumentoSanitarioProveedor>();
    public ICollection<OrdenCompra> OrdenesCompra { get; set; } = new List<OrdenCompra>();
}