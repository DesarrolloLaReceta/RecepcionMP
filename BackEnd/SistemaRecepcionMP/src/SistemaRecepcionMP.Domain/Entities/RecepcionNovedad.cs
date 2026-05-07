using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Domain.Entities;

public class RecepcionNovedad : BaseEntity
{
    public Guid RecepcionId { get; private set; }
    public Recepcion Recepcion { get; private set; } = null!;

    public TipoNovedadRecepcion TipoNovedad { get; private set; }
    public EstadoNovedadRecepcion Estado { get; private set; } = EstadoNovedadRecepcion.Pendiente;

    public DateTime FechaDeteccionUtc { get; private set; } = DateTime.UtcNow;
    public Guid DetectadaPorUserId { get; private set; }
    public Usuario DetectadaPor { get; private set; } = null!;

    public string Origen { get; private set; } = string.Empty;
    public string? Observacion { get; private set; }

    private readonly List<RecepcionNovedadDetalle> _detalles = [];
    public IReadOnlyCollection<RecepcionNovedadDetalle> Detalles => _detalles;

    private readonly List<RecepcionNovedadNotificacion> _notificaciones = [];
    public IReadOnlyCollection<RecepcionNovedadNotificacion> Notificaciones => _notificaciones;

    public RecepcionNovedad() { }

    public RecepcionNovedad(
        Guid recepcionId,
        TipoNovedadRecepcion tipoNovedad,
        Guid detectadaPorUserId,
        string origen,
        string? observacion = null)
    {
        RecepcionId = recepcionId;
        TipoNovedad = tipoNovedad;
        DetectadaPorUserId = detectadaPorUserId;
        Origen = origen;
        Observacion = observacion;
    }

    public void AgregarDetalle(RecepcionNovedadDetalle detalle)
    {
        _detalles.Add(detalle);
    }

    public void AgregarNotificacion(RecepcionNovedadNotificacion notificacion)
    {
        _notificaciones.Add(notificacion);
    }

    public void MarcarComoNotificada() => Estado = EstadoNovedadRecepcion.Notificada;
    public void MarcarEnGestion() => Estado = EstadoNovedadRecepcion.EnGestion;
    public void MarcarResuelta() => Estado = EstadoNovedadRecepcion.Resuelta;
    public void MarcarDescartada() => Estado = EstadoNovedadRecepcion.Descartada;
}
