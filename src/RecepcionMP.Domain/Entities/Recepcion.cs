using System;
using System.Linq;
using RecepcionMP.Domain.Entities;
using RecepcionMP.Domain.Events;

public class Recepcion
{
    public int Id { get; set; }
    public int OrdenCompraId { get; set; }
    public int? ProveedorId { get; set; } // Para trazabilidad directa
    public int? FacturaId { get; set; }

    public DateTime FechaRecepcion { get; set; } = DateTime.UtcNow;
    public string PlacaVehiculo { get; set; }
    public string NombreTransportista { get; set; }

    public EstadoRecepcion Estado { get; set; } = EstadoRecepcion.Pendiente;
    public string MotivoCambioEstado { get; set; }

    // Temperaturas
    public decimal? TemperaturaAlAbrirPuertas { get; set; }
    public DateTime? FechaHoraTemperatura { get; set; }

    // Propiedades de negocio
    public bool RequiereAprobacionCalidad { get; set; } = true;
    public DateTime? FechaActualizacion { get; set; }
    public string ActualizadoPor { get; set; }

    // Relaciones
    public OrdenCompra OrdenCompra { get; set; }
    public Proveedor Proveedor { get; set; }
    public ICollection<Lote> Lotes { get; set; } = new List<Lote>();
    public CheckListBPM? CheckListBPM { get; set; }
    public ICollection<RecepcionDocumento> Documentos { get; set; } = new List<RecepcionDocumento>();
    public Factura? Factura { get; set; }

    // Eventos de dominio (no se persisten, solo para publicación)
    private readonly List<DomainEvent> _domainEvents = new();
    public IReadOnlyCollection<DomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    // MÉTODOS DE VALIDACIÓN EN DOMINIO

    /// <summary>
    /// Valida que la recepción tenga lotes
    /// </summary>
    public bool TieneLotes()
    {
        return Lotes?.Any() ?? false;
    }

    /// <summary>
    /// Valida que todos los lotes tengan cantidad válida
    /// </summary>
    public bool TienenCantidadesValidas()
    {
        return Lotes?.All(l => l.CantidadRecibida > 0) ?? false;
    }

    /// <summary>
    /// Valida que el checklist BPM esté presente
    /// </summary>
    public bool TieneCheckListBPM()
    {
        return CheckListBPM != null;
    }

    /// <summary>
    /// Valida que el checklist BPM esté aprobado
    /// </summary>
    public bool CheckListBPMEstaAprobado()
    {
        return CheckListBPM?.EsAprobado() ?? false;
    }

    /// <summary>
    /// Obtiene cantidad total de lotes
    /// </summary>
    public int ObtenerCantidadLotes()
    {
        return Lotes?.Count ?? 0;
    }

    /// <summary>
    /// Valida que todos los lotes tengan fecha de vencimiento
    /// </summary>
    public bool TodosLotesTienenVencimiento()
    {
        return Lotes?.All(l => l.FechaVencimiento != default(DateTime)) ?? false;
    }

    /// <summary>
    /// Verifica si hay lotes vencidos
    /// </summary>
    public bool HayLotesVencidos()
    {
        var ahora = DateTime.UtcNow.Date;
        return Lotes?.Any(l => l.FechaVencimiento.Date <= ahora) ?? false;
    }

    // MÉTODOS DE NEGOCIO

    public void Rechazar(string motivo = null)
    {
        if (Estado == EstadoRecepcion.Rechazada)
            throw new InvalidOperationException("La recepción ya está rechazada");

        Estado = EstadoRecepcion.Rechazada;
        MotivoCambioEstado = motivo;
        ActualizarTimestamp();
    }

    public void Aceptar()
    {
        if (Estado == EstadoRecepcion.Aprobada)
            throw new InvalidOperationException("La recepción ya está aceptada");

        Estado = EstadoRecepcion.Aprobada;
        ActualizarTimestamp();
    }

    public void EnviarACalidad(string enviadoPor)
    {
        if (Estado != EstadoRecepcion.Pendiente)
            throw new InvalidOperationException($"La recepción en estado {Estado} no puede enviarse a calidad");

        Estado = EstadoRecepcion.PendienteCalidad;
        ActualizadoPor = enviadoPor;
        ActualizarTimestamp();

        // Publicar evento de dominio
        var evento = new RecepcionEnviadaACalidadEvent(
            Id,
            OrdenCompraId,
            ObtenerCantidadLotes(),
            enviadoPor);

        _domainEvents.Add(evento);
    }

    public void DefinirEstadoSegunAprobacionCalidad(string usuarioId)
    {
        if (RequiereAprobacionCalidad)
        {
            EnviarACalidad(usuarioId);
        }
        else
        {
            Aceptar();
        }
    }

    public bool DocumentosCompletos(IEnumerable<DocumentoRequerido> documentosRequeridos)
    {
        foreach (var docReq in documentosRequeridos)
        {
            var tieneDocumento = Documentos
                .Any(d => d.DocumentoRequeridoId == docReq.Id &&
                          d.Estado == EstadoDocumento.ValidadoOK);

            if (docReq.EsObligatorio && !tieneDocumento)
                return false;
        }
        return true;
    }

    public void AsociarCheckList(CheckListBPM checkList)
    {
        if (checkList == null)
            throw new ArgumentNullException(nameof(checkList));
        CheckListBPM = checkList;
    }

    public void AgregarEvento(DomainEvent evento)
    {
        if (evento != null)
            _domainEvents.Add(evento);
    }

    public void LimpiarEventos()
    {
        _domainEvents.Clear();
    }

    private void ActualizarTimestamp()
    {
        FechaActualizacion = DateTime.UtcNow;
    }
}