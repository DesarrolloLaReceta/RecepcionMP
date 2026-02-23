namespace SistemaRecepcionMP.Domain.Entities;

public class ContactoProveedor : BaseEntity
{
    public Guid ProveedorId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Cargo { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public bool EsPrincipal { get; set; }

    // Navegación
    public Proveedor Proveedor { get; set; } = null!;
}