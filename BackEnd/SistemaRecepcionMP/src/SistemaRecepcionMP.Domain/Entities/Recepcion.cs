using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Exceptions;
using SistemaRecepcionMP.Domain.Exceptions.Recepciones;

namespace SistemaRecepcionMP.Domain.Entities;

public class Recepcion : BaseEntity
{
    public string NumeroRecepcion { get; private set; } = string.Empty;
    public Guid OrdenCompraId { get; private set; }
    public OrdenCompra? OrdenCompra { get; private set; }

    public Guid ProveedorId { get; private set; }
    public Proveedor? Proveedor { get; private set; }


    public Factura? Factura { get; private set; }

    public DateOnly FechaRecepcion { get; private set; }
    public TimeOnly HoraLlegadaVehiculo { get; private set; }

    public string? PlacaVehiculo { get; private set; }
    public string? NombreTransportista { get; private set; }

    public EstadoRecepcion Estado { get; private set; } = EstadoRecepcion.Iniciada;
    public ResultadoRecepcion? Resultado { get; private set; }

    public string? ObservacionesGenerales { get; private set; }

    public Guid CreadoPorId { get; private set; }
    public Usuario CreadoPor { get; private set; } = null!;

    public DateTime CreadoEn { get; private set; } = DateTime.UtcNow;
    public DateTime? ActualizadoEn { get; private set; }
    public DateTime? FechaFinalizacion { get; private set; }

    private readonly List<RecepcionItem> _items = new();
    public IReadOnlyCollection<RecepcionItem> Items => _items;

    private readonly List<Factura> _facturas = new();
    public IReadOnlyCollection<Factura> Facturas => _facturas;

    private readonly List<DocumentoRecepcion> _documentos = new();
    public IReadOnlyCollection<DocumentoRecepcion> Documentos => _documentos;

    private readonly List<TemperaturaRegistro> _registrosTemperatura = new();
    public IReadOnlyCollection<TemperaturaRegistro> RegistrosTemperatura => _registrosTemperatura;

    public InspeccionVehiculo? InspeccionVehiculo { get; private set; }

    public Recepcion() { }

    public Recepcion(Guid ordenCompraId, Guid proveedorId, Usuario creadoPor)
    {
        OrdenCompraId = ordenCompraId;
        ProveedorId = proveedorId;
        CreadoPor = creadoPor;
        Estado = EstadoRecepcion.Iniciada;
    }


    public void RegistrarLlegada(
        DateOnly fecha,
        TimeOnly hora,
        string placa,
        string transportista)
    {
        if (Estado != EstadoRecepcion.Iniciada)
            throw new RecepcionEstadoInvalidoException(
                NumeroRecepcion, Estado, "registrar llegada");

        FechaRecepcion = fecha;
        HoraLlegadaVehiculo = hora;
        PlacaVehiculo = placa;
        NombreTransportista = transportista;

        Estado = EstadoRecepcion.InspeccionVehiculo;
    }

    public void RegistrarInspeccionVehiculo(
        decimal? temperatura,
        bool tempOk,
        bool empaqueOk,
        bool limpiezaOk,
        bool olores,
        bool plagas,
        bool docsOk,
        string? observaciones)
    {
        if (Estado != EstadoRecepcion.InspeccionVehiculo)
            throw new RecepcionEstadoInvalidoException(
                NumeroRecepcion, Estado, "registrar inspección");

        var aprobado = CalcularAprobacion(
            tempOk, empaqueOk, limpiezaOk, olores, plagas, docsOk);

        InspeccionVehiculo = new InspeccionVehiculo
        {
            TemperaturaInicial = temperatura,
            TemperaturaDentroRango = tempOk,
            IntegridadEmpaque = empaqueOk,
            LimpiezaVehiculo = limpiezaOk,
            PresenciaOloresExtranos = olores,
            PlagasVisible = plagas,
            DocumentosTransporteOk = docsOk,
            Observaciones = observaciones,
            FechaRegistro = DateTime.UtcNow
        };

        if (!aprobado)
        {
            Estado = EstadoRecepcion.Rechazada;
            Resultado = ResultadoRecepcion.RechazoTotal;
            return;
        }

        Estado = EstadoRecepcion.RegistroLotes;
    }

    private bool CalcularAprobacion(
        bool tempOk,
        bool empaqueOk,
        bool limpiezaOk,
        bool olores,
        bool plagas,
        bool docsOk)
    {
        if (plagas) return false;
        if (!docsOk) return false;
        if (!limpiezaOk) return false;

        return true;
    }

    public void AgregarItem(RecepcionItem item)
    {
        if (Estado != EstadoRecepcion.RegistroLotes &&
            Estado != EstadoRecepcion.InspeccionVehiculo)
        {
            throw new RecepcionEstadoInvalidoException(
                NumeroRecepcion, Estado, "agregar item");
        }

        if (_items.Any(x => x.DetalleOrdenCompraId == item.DetalleOrdenCompraId))
            throw new BusinessRuleException("El item ya fue agregado");

        _items.Add(item);
    }

    public void AgregarFactura(Factura factura)
    {
        if (Factura is not null)
            throw new BusinessRuleException("La recepción ya tiene una factura.");

        factura.SetRecepcion(Id);

        Factura = factura;
    }

    public void ValidarPuedeRegistrarLotes()
    {
        if (Estado != EstadoRecepcion.InspeccionVehiculo &&
            Estado != EstadoRecepcion.RegistroLotes)
        {
            throw new RecepcionEstadoInvalidoException(NumeroRecepcion, Estado, "registrar lote");
        }
    }

    public void PasarARegistroLotes()
    {
        if (!_items.Any())
            throw new BusinessRuleException("No hay ítems para registrar lotes.");

        Estado = EstadoRecepcion.RegistroLotes;
    }

    public void Finalizar()
    {
        if (Estado == EstadoRecepcion.Finalizada)
            throw new BusinessRuleException("La recepción ya está finalizada.");

        if (Factura is null)
            throw new BusinessRuleException("Debe registrar una factura.");

        if (!_items.Any())
            throw new BusinessRuleException("No hay items en la recepción.");

        var lotes = _items.SelectMany(i => i.Lotes).ToList();

        if (!lotes.Any())
            throw new BusinessRuleException("No hay lotes.");

        if (lotes.Any(l => l.Estado == EstadoLote.PendienteCalidad))
            throw new BusinessRuleException("Hay lotes sin evaluar.");

        var totalRecibido = lotes.Sum(l => l.CantidadRecibida);
        var totalRechazado = lotes.Sum(l => l.CantidadRechazada);
        var totalAceptado = totalRecibido - totalRechazado;

        if (totalAceptado <= 0)
        {
            Resultado = ResultadoRecepcion.RechazoTotal;
        }
        else if (totalRechazado > 0)
        {
            Resultado = ResultadoRecepcion.ConObservaciones;
        }
        else
        {
            Resultado = ResultadoRecepcion.Conforme;
        }

        Estado = EstadoRecepcion.Finalizada;
        FechaFinalizacion = DateTime.UtcNow;
    }

    public void MarcarPendienteAjuste(string? observaciones = null)
    {
        Estado = EstadoRecepcion.PendienteAjuste;
        if (!string.IsNullOrWhiteSpace(observaciones))
        {
            ObservacionesGenerales = observaciones;
        }
    }

    private void ValidarPuedeFinalizar()
    {
        if (Estado != EstadoRecepcion.RegistroLotes)
            throw new RecepcionEstadoInvalidoException(NumeroRecepcion, Estado, "finalizar");

        if (!_items.Any())
            throw new BusinessRuleException("No hay ítems en la recepción.");

        if (_items.All(i => !i.Lotes.Any()))
            throw new BusinessRuleException("No se han registrado lotes.");
    }

    private ResultadoRecepcion CalcularResultado(decimal esperado, decimal recibido, decimal rechazado)
    {
        if (recibido == 0)
            return ResultadoRecepcion.RechazoTotal;

        if (rechazado == 0 && recibido == esperado)
            return ResultadoRecepcion.Conforme;

        if (rechazado > 0 && recibido > 0)
            return ResultadoRecepcion.ConObservaciones;

        if (recibido < esperado)
            return ResultadoRecepcion.Incompleto;

        return ResultadoRecepcion.ConObservaciones;
    }

    public void AgregarObservaciones(string observaciones)
    {
        ObservacionesGenerales = observaciones;
    }

    public void AgregarLoteAItem(Guid itemId, LoteRecibido lote)
    {
        ValidarPuedeRegistrarLotes();

        var item = Items.First(x => x.Id == itemId);

        item.AgregarLote(lote);
    }

    public void AgregarDocumento(DocumentoRecepcion documento)
    {
        if (documento == null)
            throw new ArgumentNullException(nameof(documento));

        _documentos.Add(documento);
    }
}