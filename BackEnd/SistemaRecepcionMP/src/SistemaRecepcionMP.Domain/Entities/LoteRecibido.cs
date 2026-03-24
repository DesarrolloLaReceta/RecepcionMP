using SistemaRecepcionMP.Domain.ValueObjects;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Exceptions.Lotes;
using SistemaRecepcionMP.Domain.Exceptions;
using SistemaRecepcionMP.Domain.Exceptions.Calidad;

namespace SistemaRecepcionMP.Domain.Entities;

public class LoteRecibido : BaseEntity
{
    public Guid RecepcionItemId { get; private set; }
    public string? NumeroLoteProveedor { get; private set; }
    public string CodigoLoteInterno { get; private set; } = string.Empty;
    public DateOnly? FechaFabricacion { get; private set; }
    public VidaUtil? VidaUtil { get; private set; }
    public decimal CantidadRecibida { get; private set; }
    public decimal CantidadRechazada { get; private set; }
    public string UnidadMedida { get; private set; } = string.Empty;
    public decimal? TemperaturaMedida { get; private set; }
    public EstadoSensorial EstadoSensorial { get; private set; }
    public EstadoRotulado EstadoRotulado { get; private set; }
    public EstadoLote Estado { get; private set; } = EstadoLote.PendienteCalidad;
    public UbicacionDestino? UbicacionDestino { get; private set; }
    public string? CodigoQr { get; private set; }
    public Guid RegistradoPor { get; private set; }
    public DateTime FechaRegistro { get; private set; } = DateTime.UtcNow;

    // Navegación
    public Recepcion Recepcion { get; init; } = null!;
    public DetalleOrdenCompra DetalleOrdenCompra { get; init; } = null!;
    public Item Item { get; init; } = null!;
    public Usuario UsuarioRegistrador { get; init; } = null!;
    public LiberacionLote? Liberacion { get; private set; }
    public Cuarentena? Cuarentena { get; private set; }
    public ICollection<DocumentoRecepcion> Documentos { get; private set; } = new List<DocumentoRecepcion>();
    public ICollection<ResultadoChecklist> ResultadosChecklist { get; private set; } = new List<ResultadoChecklist>();
    public ICollection<NoConformidad> NoConformidades { get; private set; } = new List<NoConformidad>();
    public ICollection<TemperaturaRegistro> RegistrosTemperatura { get; private set; } = new List<TemperaturaRegistro>();

    // Método de fábrica — construye el lote con todas sus propiedades iniciales
    public static LoteRecibido Crear(
        Guid recepcionItemId,
        string? numeroLoteProveedor,
        string codigoLoteInterno,
        DateOnly? fechaFabricacion,
        VidaUtil vidaUtil,
        decimal cantidadRecibida,
        string unidadMedida,
        decimal? temperaturaMedida,
        EstadoSensorial estadoSensorial,
        EstadoRotulado estadoRotulado,
        UbicacionDestino? ubicacionDestino,
        Guid registradoPor)
    {
        return new LoteRecibido
        {
            RecepcionItemId = recepcionItemId,
            NumeroLoteProveedor = numeroLoteProveedor,
            CodigoLoteInterno = codigoLoteInterno,
            FechaFabricacion = fechaFabricacion,
            VidaUtil = vidaUtil,
            CantidadRecibida = cantidadRecibida,
            CantidadRechazada = 0,
            UnidadMedida = unidadMedida,
            TemperaturaMedida = temperaturaMedida,
            EstadoSensorial = estadoSensorial,
            EstadoRotulado = estadoRotulado,
            Estado = EstadoLote.PendienteCalidad,
            UbicacionDestino = ubicacionDestino,
            RegistradoPor = registradoPor,
            FechaRegistro = DateTime.UtcNow
        };
    }

    // Asigna el QR una vez generado
    public void AsignarCodigoQr(byte[] url) => CodigoQr = Convert.ToBase64String(url);

    // Métodos de negocio
    public bool CumpleVidaUtilMinima(int diasMinimosExigidos)
        => VidaUtil.CumpleVidaUtilMinima(diasMinimosExigidos);

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
}