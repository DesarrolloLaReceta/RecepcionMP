using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Domain.Entities;

public class Recepcion : BaseEntity
{
    public string NumeroRecepcion { get; set; } = string.Empty;
    public Guid OrdenCompraId { get; set; }
    public Guid ProveedorId { get; set; }
    public DateOnly FechaRecepcion { get; set; }
    public TimeOnly HoraLlegadaVehiculo { get; set; }
    public string? PlacaVehiculo { get; set; }
    public string? NombreTransportista { get; set; }
    public EstadoRecepcion Estado { get; set; } = EstadoRecepcion.Borrador;
    public string? ObservacionesGenerales { get; set; }
    public Guid CreadoPor { get; set; }
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;
    public DateTime? ActualizadoEn { get; set; }

    // Navegación
    public OrdenCompra OrdenCompra { get; set; } = null!;
    public Proveedor Proveedor { get; set; } = null!;
    public Usuario UsuarioCreador { get; set; } = null!;
    public Factura? Factura { get; set; }
    public InspeccionVehiculo? InspeccionVehiculo { get; set; }
    public ICollection<LoteRecibido> Lotes { get; set; } = new List<LoteRecibido>();
    public ICollection<DocumentoRecepcion> Documentos { get; set; } = new List<DocumentoRecepcion>();
    public ICollection<TemperaturaRegistro> RegistrosTemperatura { get; set; } = new List<TemperaturaRegistro>();
}