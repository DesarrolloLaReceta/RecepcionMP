using AutoMapper;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Exceptions.Lotes;
using SistemaRecepcionMP.Domain.Interfaces;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Queries;

// ─── Query ───────────────────────────────────────────────────────────────────

public sealed class GetTrazabilidadLoteQuery : IRequest<TrazabilidadLoteDto>
{
    public Guid LoteId { get; set; }
    public GetTrazabilidadLoteQuery(Guid loteId) => LoteId = loteId;
}

// ─── DTO especializado de trazabilidad ───────────────────────────────────────

/// <summary>
/// DTO completo de trazabilidad de un lote: toda la cadena desde la OC
/// hasta el estado actual, pasando por inspección, temperaturas y calidad.
/// Cumple el requisito de trazabilidad exigido por INVIMA / Res. 2674.
/// </summary>
public sealed class TrazabilidadLoteDto
{
    // Identidad del lote
    public Guid Id { get; set; }
    public string CodigoLoteInterno { get; set; } = string.Empty;
    public string? NumeroLoteProveedor { get; set; }
    public string CodigoQr { get; set; } = string.Empty;
    public EstadoLote Estado { get; set; }

    // Ítem
    public string ItemCodigo { get; set; } = string.Empty;
    public string ItemNombre { get; set; } = string.Empty;
    public string CategoriaNombre { get; set; } = string.Empty;

    // Origen — OC y proveedor
    public string NumeroOC { get; set; } = string.Empty;
    public string NumeroRecepcion { get; set; } = string.Empty;
    public string ProveedorNombre { get; set; } = string.Empty;
    public string ProveedorNit { get; set; } = string.Empty;

    // Fechas clave de trazabilidad
    public DateOnly? FechaFabricacion { get; set; }
    public DateOnly FechaVencimiento { get; set; }
    public int DiasVidaUtilRestantes { get; set; }
    public DateOnly FechaRecepcion { get; set; }

    // Cantidades
    public decimal CantidadRecibida { get; set; }
    public decimal CantidadRechazada { get; set; }
    public string UnidadMedida { get; set; } = string.Empty;

    // Condiciones físicas al ingreso
    public decimal? TemperaturaMedida { get; set; }
    public EstadoSensorial EstadoSensorial { get; set; }
    public EstadoRotulado EstadoRotulado { get; set; }
    public UbicacionDestino? UbicacionDestino { get; set; }

    // Inspección del vehículo
    public InspeccionVehiculoResumenDto? InspeccionVehiculo { get; set; }

    // Calidad
    public LiberacionLoteResumenDto? Liberacion { get; set; }
    public CuarentenaResumenDto? Cuarentena { get; set; }

    // Historial completo
    public List<TemperaturaRegistroResumenDto> HistorialTemperaturas { get; set; } = new();
    public List<ResultadoChecklistResumenDto> ResultadosChecklist { get; set; } = new();
    public List<NoConformidadResumenDto2> NoConformidades { get; set; } = new();
    public List<DocumentoResumenDto> Documentos { get; set; } = new();

    // Auditoría
    public string RegistradoPorNombre { get; set; } = string.Empty;
    public DateTime FechaRegistro { get; set; }
}

public sealed class InspeccionVehiculoResumenDto
{
    public ResultadoInspeccion Resultado { get; set; }
    public decimal? TemperaturaInicial { get; set; }
    public bool TemperaturaDentroRango { get; set; }
    public bool LimpiezaVehiculo { get; set; }
    public bool PlagasVisible { get; set; }
    public string? Observaciones { get; set; }
}

public sealed class LiberacionLoteResumenDto
{
    public DecisionLiberacion Decision { get; set; }
    public string? Observaciones { get; set; }
    public string LiberadoPorNombre { get; set; } = string.Empty;
    public DateTime FechaLiberacion { get; set; }
}

public sealed class CuarentenaResumenDto
{
    public DateOnly FechaCuarentena { get; set; }
    public DateOnly? FechaLiberacion { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public DecisionCuarentena? Decision { get; set; }
    public bool EstaActiva { get; set; }
}

public sealed class TemperaturaRegistroResumenDto
{
    public decimal Temperatura { get; set; }
    public DateTime FechaHora { get; set; }
    public OrigenTemperatura Origen { get; set; }
    public bool EstaFueraDeRango { get; set; }
    public string? Observacion { get; set; }
}

public sealed class ResultadoChecklistResumenDto
{
    public string Criterio { get; set; } = string.Empty;
    public bool EsCritico { get; set; }
    public ResultadoItem Resultado { get; set; }
    public string? Observacion { get; set; }
}

public sealed class NoConformidadResumenDto2
{
    public TipoNoConformidad Tipo { get; set; }
    public string CausalNombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public EstadoNoConformidad Estado { get; set; }
    public DateTime CreadoEn { get; set; }
}

public sealed class DocumentoResumenDto
{
    public TipoDocumento TipoDocumento { get; set; }
    public string NombreArchivo { get; set; } = string.Empty;
    public string AdjuntoUrl { get; set; } = string.Empty;
    public bool? EsValido { get; set; }
}

// ─── Handler ─────────────────────────────────────────────────────────────────

public sealed class GetTrazabilidadLoteQueryHandler
    : IRequestHandler<GetTrazabilidadLoteQuery, TrazabilidadLoteDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetTrazabilidadLoteQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<TrazabilidadLoteDto> Handle(
        GetTrazabilidadLoteQuery request,
        CancellationToken cancellationToken)
    {
        var lote = await _unitOfWork.Lotes.GetByIdAsync(request.LoteId)
            ?? throw new LoteNotFoundException(request.LoteId);

        var recepcion = await _unitOfWork.Recepciones.GetWithLotesAsync(lote.RecepcionId)
            ?? throw new Domain.Exceptions.BusinessRuleException(
                $"No se encontró la recepción asociada al lote '{lote.CodigoLoteInterno}'.");

        var temperaturas = await _unitOfWork.Temperaturas.GetByLoteAsync(lote.Id);
        var noConformidades = (await _unitOfWork.NoConformidades.GetAllAsync())
            .Where(nc => nc.LoteRecibidoId == lote.Id);

        // Construcción manual del DTO de trazabilidad — no se usa AutoMapper aquí
        // porque cruza múltiples agregados y es una proyección especializada
        return new TrazabilidadLoteDto
        {
            Id = lote.Id,
            CodigoLoteInterno = lote.CodigoLoteInterno,
            NumeroLoteProveedor = lote.NumeroLoteProveedor,
            CodigoQr = lote.CodigoQr ?? string.Empty,
            Estado = lote.Estado,

            ItemCodigo = lote.Item?.CodigoInterno ?? string.Empty,
            ItemNombre = lote.Item?.Nombre ?? string.Empty,
            CategoriaNombre = lote.Item?.Categoria?.Nombre ?? string.Empty,

            NumeroOC = recepcion.OrdenCompra?.NumeroOC ?? string.Empty,
            NumeroRecepcion = recepcion.NumeroRecepcion,
            ProveedorNombre = recepcion.Proveedor?.RazonSocial ?? string.Empty,
            ProveedorNit = recepcion.Proveedor?.Nit ?? string.Empty,

            FechaFabricacion = lote.FechaFabricacion,
            FechaVencimiento = lote.VidaUtil.FechaVencimiento,
            DiasVidaUtilRestantes = lote.VidaUtil.DiasRestantes,
            FechaRecepcion = recepcion.FechaRecepcion,

            CantidadRecibida = lote.CantidadRecibida,
            CantidadRechazada = lote.CantidadRechazada,
            UnidadMedida = lote.UnidadMedida,

            TemperaturaMedida = lote.TemperaturaMedida,
            EstadoSensorial = lote.EstadoSensorial,
            EstadoRotulado = lote.EstadoRotulado,
            UbicacionDestino = lote.UbicacionDestino,

            InspeccionVehiculo = recepcion.InspeccionVehiculo is null ? null :
                new InspeccionVehiculoResumenDto
                {
                    Resultado = recepcion.InspeccionVehiculo.Resultado,
                    TemperaturaInicial = recepcion.InspeccionVehiculo.TemperaturaInicial,
                    TemperaturaDentroRango = recepcion.InspeccionVehiculo.TemperaturaDentroRango,
                    LimpiezaVehiculo = recepcion.InspeccionVehiculo.LimpiezaVehiculo,
                    PlagasVisible = recepcion.InspeccionVehiculo.PlagasVisible,
                    Observaciones = recepcion.InspeccionVehiculo.Observaciones
                },

            Liberacion = lote.Liberacion is null ? null :
                new LiberacionLoteResumenDto
                {
                    Decision = lote.Liberacion.Decision,
                    Observaciones = lote.Liberacion.Observaciones,
                    LiberadoPorNombre = lote.Liberacion.UsuarioCalidad?.Nombre ?? string.Empty,
                    FechaLiberacion = lote.Liberacion.FechaLiberacion
                },

            Cuarentena = lote.Cuarentena is null ? null :
                new CuarentenaResumenDto
                {
                    FechaCuarentena = lote.Cuarentena.FechaCuarentena,
                    FechaLiberacion = lote.Cuarentena.FechaLiberacion,
                    Motivo = lote.Cuarentena.Motivo,
                    Decision = lote.Cuarentena.Decision,
                    EstaActiva = lote.Cuarentena.FechaLiberacion is null
                },

            HistorialTemperaturas = temperaturas.Select(t => new TemperaturaRegistroResumenDto
            {
                Temperatura = t.Temperatura,
                FechaHora = t.FechaHora,
                Origen = t.Origen,
                EstaFueraDeRango = t.EstaFueraDeRango,
                Observacion = t.Observacion
            }).OrderBy(t => t.FechaHora).ToList(),

            ResultadosChecklist = lote.ResultadosChecklist?.Select(r => new ResultadoChecklistResumenDto
            {
                Criterio = r.ItemChecklist?.Criterio ?? string.Empty,
                EsCritico = r.ItemChecklist?.EsCritico ?? false,
                Resultado = r.Resultado,
                Observacion = r.Observacion
            }).ToList() ?? new(),

            NoConformidades = noConformidades.Select(nc => new NoConformidadResumenDto2
            {
                Tipo = nc.Tipo,
                CausalNombre = nc.Causal?.Nombre ?? string.Empty,
                Descripcion = nc.Descripcion,
                Estado = nc.Estado,
                CreadoEn = nc.CreadoEn
            }).ToList(),

            Documentos = lote.Documentos?.Select(d => new DocumentoResumenDto
            {
                TipoDocumento = d.TipoDocumento,
                NombreArchivo = d.NombreArchivo,
                AdjuntoUrl = d.AdjuntoUrl,
                EsValido = d.EsValido
            }).ToList() ?? new(),

            RegistradoPorNombre = lote.UsuarioRegistrador?.Nombre ?? string.Empty,
            FechaRegistro = lote.FechaRegistro
        };
    }
}