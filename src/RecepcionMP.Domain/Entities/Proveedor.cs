namespace RecepcionMP.Domain.Entities;

public class Proveedor
{
    public int Id { get; set; }
    public string RazonSocial { get; set; } = string.Empty;
    public string NIT { get; set; } = string.Empty;
    public string Contacto { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Telefono { get; set; }
    public bool Activo { get; set; } = true;
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    
    // Relación con documentos
    public ICollection<DocumentoProveedor> Documentos { get; set; } = new List<DocumentoProveedor>();
    // Items provistos por este proveedor
    public ICollection<Item> Items { get; set; } = new List<Item>();
}