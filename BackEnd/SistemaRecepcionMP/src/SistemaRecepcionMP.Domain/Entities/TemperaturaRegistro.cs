using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Domain.Entities;

public class TemperaturaRegistro : BaseEntity
{
    public Guid? RecepcionId { get; set; }
    public Guid? LoteRecibidoId { get; set; }
    public decimal Temperatura { get; set; }
    public string UnidadMedida { get; set; } = "°C";
    public DateTime FechaHora { get; set; } = DateTime.UtcNow;
    public OrigenTemperatura Origen { get; set; }
    public string? DispositivoId { get; set; }
    public bool EstaFueraDeRango { get; set; }
    public string? Observacion { get; set; }
    public Guid? RegistradoPor { get; set; }

    // Navegación
    public Recepcion? Recepcion { get; set; }
    public LoteRecibido? LoteRecibido { get; set; }
    public Usuario? UsuarioRegistrador { get; set; }
}