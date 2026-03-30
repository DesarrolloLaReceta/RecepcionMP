using SistemaRecepcionMP.Domain.ValueObjects;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Exceptions.Lotes;
using SistemaRecepcionMP.Domain.Exceptions;
using SistemaRecepcionMP.Domain.Exceptions.Calidad;

namespace SistemaRecepcionMP.Domain.Entities;

public class LoteRecibido : BaseEntity
{

    public Guid RecepcionItemId { get; private set; }
    public RecepcionItem? RecepcionItem { get; private set; }
    public string? NumeroLoteProveedor { get; private set; }
    public string CodigoLoteInterno { get; private set; } = string.Empty;
    public DateOnly? FechaFabricacion { get; private set; }
    public VidaUtil? VidaUtil { get; private set; } = null!;
    public decimal CantidadRecibida { get; private set; }
    public decimal CantidadRechazada { get; private set; }
    public decimal CantidadAceptada => CantidadRecibida - CantidadRechazada;
    public string UnidadMedida { get; private set; } = string.Empty;
    public decimal? TemperaturaMedida { get; private set; }
    public EstadoSensorial EstadoSensorial { get; private set; }
    public EstadoRotulado EstadoRotulado { get; private set; }
    public string? ObservacionesCalidad { get; private set; }
    public EstadoLote Estado { get; private set; } = EstadoLote.PendienteCalidad;
    public UbicacionDestino? UbicacionDestino { get; private set; }
    public string? CodigoQr { get; private set; }
    public Guid RegistradoPor { get; private set; }
    public DateTime FechaRegistro { get; private set; } = DateTime.UtcNow;
    public DateOnly FechaVencimiento { get; private set; }

    // Navegación
    public Recepcion Recepcion { get; init; } = null!;
    public DetalleOrdenCompra DetalleOrdenCompra { get; init; } = null!;
    public Usuario UsuarioRegistrador { get; init; } = null!;
    public LiberacionLote? Liberacion { get; private set; }
    public Cuarentena? Cuarentena { get; private set; }
    public ICollection<DocumentoRecepcion> Documentos { get; private set; } = new List<DocumentoRecepcion>();
    public ICollection<ResultadoChecklist> ResultadosChecklist { get; private set; } = new List<ResultadoChecklist>();
    public ICollection<NoConformidad> NoConformidades { get; private set; } = new List<NoConformidad>();
    public ICollection<TemperaturaRegistro> RegistrosTemperatura { get; private set; } = new List<TemperaturaRegistro>();

    public LoteRecibido() { }

    // Método de fábrica — construye el lote con todas sus propiedades iniciales
    public LoteRecibido(
    Guid itemId,
    string? numeroLoteProveedor,
    DateOnly? fechaFabricacion,
    DateOnly fechaVencimiento,
    decimal cantidadRecibida,
    decimal cantidadRechazada,
    string unidadMedida,
    decimal? temperaturaMedida,
    EstadoSensorial estadoSensorial,
    EstadoRotulado estadoRotulado,
    UbicacionDestino? ubicacionDestino
)
{
    if (cantidadRecibida <= 0)
        throw new BusinessRuleException("La cantidad recibida debe ser mayor a cero");

    if (cantidadRechazada < 0 || cantidadRechazada > cantidadRecibida)
        throw new BusinessRuleException("Cantidad rechazada inválida");

    if (fechaVencimiento <= DateOnly.FromDateTime(DateTime.UtcNow))
        throw new BusinessRuleException("El lote está vencido");

    Id = Guid.NewGuid();
    RecepcionItemId = itemId;

    NumeroLoteProveedor = numeroLoteProveedor;
    FechaFabricacion = fechaFabricacion;
    FechaVencimiento = fechaVencimiento;

    CantidadRecibida = cantidadRecibida;
    CantidadRechazada = cantidadRechazada;
    UnidadMedida = unidadMedida;

    TemperaturaMedida = temperaturaMedida;
    EstadoSensorial = estadoSensorial;
    EstadoRotulado = estadoRotulado;

    Estado = EstadoLote.PendienteCalidad;
    UbicacionDestino = ubicacionDestino;

    FechaRegistro = DateTime.UtcNow;

    GenerarCodigoInterno();
}

    // Asigna el QR una vez generado
    public void AsignarCodigoQr(byte[] url) => CodigoQr = Convert.ToBase64String(url);

    // Métodos de negocio
    public bool CumpleVidaUtilMinima(int diasMinimosExigidos)
        => VidaUtil is not null && VidaUtil.CumpleVidaUtilMinima(diasMinimosExigidos);

    public bool CumpleRangoTemperatura(RangoTemperatura rango)
        => TemperaturaMedida.HasValue && rango.ContieneValor(TemperaturaMedida.Value);

    public void Rechazar(decimal cantidadRechazada)
    {
        if (cantidadRechazada <= 0)
            throw new BusinessRuleException("La cantidad rechazada debe ser mayor a cero.");

        if (cantidadRechazada > CantidadRecibida)
            throw new BusinessRuleException("La cantidad rechazada no puede exceder la cantidad recibida.");

        CantidadRechazada = cantidadRechazada;
        Estado = cantidadRechazada == CantidadRecibida
            ? EstadoLote.RechazadoTotal
            : EstadoLote.RechazadoParcial;
    }

    public void PonerEnCuarentena()
{
    if (Estado == EstadoLote.Liberado)
        throw new LoteYaLiberadoException(CodigoLoteInterno);

    if (Estado == EstadoLote.EnCuarentena)
        throw new BusinessRuleException($"El lote '{CodigoLoteInterno}' ya se encuentra en cuarentena.");

    Estado = EstadoLote.EnCuarentena;
}

    public void Liberar()
    {
        if (Estado == EstadoLote.Liberado)
            throw new LoteYaLiberadoException(CodigoLoteInterno);

        if (Estado == EstadoLote.RechazadoTotal)
            throw new BusinessRuleException($"El lote '{CodigoLoteInterno}' fue rechazado totalmente y no puede liberarse.");
        
        var abiertas = NoConformidades
        .Where(n => n.Estado != EstadoNoConformidad.Cerrada)
        .ToList();

        if (abiertas.Any())
            throw new NoConformidadNoSolucionadaException(CodigoLoteInterno, abiertas.Count);

        Estado = EstadoLote.Liberado;
    }

    public void AgregarLiberacion(LiberacionLote liberacion)
    {
        if (Liberacion is not null)
            throw new LoteYaLiberadoException(CodigoLoteInterno);

        Liberacion = liberacion;
    }

    public void AgregarCuarentena(Cuarentena cuarentena)
    {
        if (Cuarentena is not null)
            throw new BusinessRuleException(
                $"El lote '{CodigoLoteInterno}' ya tiene una cuarentena registrada.");

        Cuarentena = cuarentena;
    }

    private void GenerarCodigoInterno()
    {
        CodigoLoteInterno = $"LOT-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString()[..4]}";
    }

    public void EvaluarCalidad(
        EstadoCalidad estado,
        decimal? cantidadAprobada,
        decimal? cantidadRechazada,
        string? observaciones)
    {
        if (Estado != EstadoLote.PendienteCalidad)
            throw new BusinessRuleException("El lote ya fue evaluado.");

        if (CantidadRecibida <= 0)
            throw new BusinessRuleException("El lote no tiene cantidad recibida.");

        switch (estado)
        {
            case EstadoCalidad.Aprobado:
                CantidadRechazada = 0;
                Estado = EstadoLote.Liberado;
                break;

            case EstadoCalidad.Rechazado:
                CantidadRechazada = CantidadRecibida;
                Estado = EstadoLote.RechazadoTotal;
                break;

            case EstadoCalidad.AprobadoCondicional:

                if (cantidadRechazada is null || cantidadRechazada <= 0)
                    throw new BusinessRuleException("Debe indicar cantidad rechazada.");

                if (cantidadRechazada > CantidadRecibida)
                    throw new BusinessRuleException("La cantidad rechazada no puede ser mayor a la recibida.");

                CantidadRechazada = cantidadRechazada.Value;

                Estado = CantidadRechazada == CantidadRecibida
                    ? EstadoLote.RechazadoTotal
                    : EstadoLote.RechazadoParcial;

                break;

            default:
                throw new BusinessRuleException("Estado de calidad inválido.");
        }

        ObservacionesCalidad = observaciones;
    }
}