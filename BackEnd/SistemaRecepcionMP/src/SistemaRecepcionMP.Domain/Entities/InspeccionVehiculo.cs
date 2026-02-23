using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Domain.Entities;

public class InspeccionVehiculo : BaseEntity
{
    public Guid RecepcionId { get; set; }
    public decimal? TemperaturaInicial { get; set; }
    public bool TemperaturaDentroRango { get; set; }
    public bool IntegridadEmpaque { get; set; }
    public bool LimpiezaVehiculo { get; set; }
    public bool PresenciaOloresExtranos { get; set; }
    public bool PlagasVisible { get; set; }
    public bool DocumentosTransporteOk { get; set; }
    public ResultadoInspeccion Resultado { get; set; }
    public string? Observaciones { get; set; }
    public Guid RegistradoPor { get; set; }
    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

    // Navegación
    public Recepcion Recepcion { get; set; } = null!;
    public Usuario UsuarioRegistrador { get; set; } = null!;
}