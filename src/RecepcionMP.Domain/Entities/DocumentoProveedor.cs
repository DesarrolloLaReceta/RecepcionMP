namespace RecepcionMP.Domain.Entities;

public class DocumentoProveedor
{
    public int Id { get; set; }

    public int ProveedorId { get; set; }
    public Proveedor Proveedor { get; set; } = null!;

    public string Tipo { get; set; } = string.Empty;
    public string RutaArchivo { get; set; } = string.Empty;
    public DateTime FechaVencimiento { get; set; }

    // Alias/nullable field used by application layer in some services
    public DateTime? FechaVigencia { get; set; }
}
