using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Interfaces;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Queries;

// ─── Query ───────────────────────────────────────────────────────────────────

public sealed class GetLotesPendientesLiberacionQuery : IRequest<List<LotePendienteDto>> { }

// ─── DTO ─────────────────────────────────────────────────────────────────────

public sealed class LotePendienteDto
{
    public Guid Id { get; set; }
    public string NumeroLoteInterno { get; set; } = string.Empty;
    public string? NumeroLoteProveedor { get; set; }

    public Guid ItemId { get; set; }
    public string ItemNombre { get; set; } = string.Empty;
    public string ItemCodigo { get; set; } = string.Empty;
    public string CategoriaNombre { get; set; } = string.Empty;

    public string ProveedorNombre { get; set; } = string.Empty;
    public Guid RecepcionId { get; set; }
    public string NumeroRecepcion { get; set; } = string.Empty;
    public DateOnly FechaRecepcion { get; set; }

    public DateOnly? FechaFabricacion { get; set; }
    public DateOnly FechaVencimiento { get; set; }
    public int DiasParaVencer { get; set; }

    public decimal CantidadRecibida { get; set; }
    public string UnidadMedida { get; set; } = string.Empty;

    public bool RequiereCadenaFrio { get; set; }
    public decimal? TemperaturaMedida { get; set; }
    public decimal? TemperaturaMinima { get; set; }
    public decimal? TemperaturaMaxima { get; set; }
    public bool? TemperaturaDentroRango { get; set; }

    public EstadoSensorial EstadoSensorial { get; set; }
    public EstadoRotulado EstadoRotulado { get; set; }
    public UbicacionDestino? UbicacionDestino { get; set; }
    public EstadoLote Estado { get; set; }

    public bool TieneDocumentosFaltantes { get; set; }
    public List<string> DocumentosFaltantes { get; set; } = new();
    public string? ObservacionesRecepcion { get; set; }
}

// ─── Handler ─────────────────────────────────────────────────────────────────

public sealed class GetLotesPendientesLiberacionQueryHandler
    : IRequestHandler<GetLotesPendientesLiberacionQuery, List<LotePendienteDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetLotesPendientesLiberacionQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<LotePendienteDto>> Handle(
    GetLotesPendientesLiberacionQuery request,
    CancellationToken cancellationToken)
{
    var pendientes = (await _unitOfWork.Lotes.GetByEstadoAsync(EstadoLote.Pendiente))
        .OrderBy(l => l.VidaUtil.FechaVencimiento)
        .ToList();

    return pendientes.Select(lote => new LotePendienteDto
    {
        Id = lote.Id,
        NumeroLoteInterno = lote.CodigoLoteInterno,
        NumeroLoteProveedor = lote.NumeroLoteProveedor,

        ItemId = lote.Item?.Id ?? Guid.Empty,
        ItemNombre = lote.Item?.Nombre ?? string.Empty,
        ItemCodigo = lote.Item?.CodigoInterno ?? string.Empty,
        CategoriaNombre = lote.Item?.Categoria?.Nombre ?? string.Empty,

        // ✅ Recepcion ya viene incluida en GetByEstadoAsync
        ProveedorNombre = lote.Recepcion?.Proveedor?.RazonSocial ?? string.Empty,
        RecepcionId = lote.RecepcionId,
        NumeroRecepcion = lote.Recepcion?.NumeroRecepcion ?? string.Empty,
        FechaRecepcion = lote.Recepcion?.FechaRecepcion ?? DateOnly.MinValue,

        FechaFabricacion = lote.FechaFabricacion,
        FechaVencimiento = lote.VidaUtil.FechaVencimiento,
        DiasParaVencer = lote.VidaUtil.DiasRestantes,

        CantidadRecibida = lote.CantidadRecibida,
        UnidadMedida = lote.UnidadMedida,

        // ⚠️ RangoTemperatura llegará null hasta agregar el Include
        RequiereCadenaFrio = lote.Item?.RangoTemperatura is not null,
        TemperaturaMedida = lote.TemperaturaMedida,
        TemperaturaMinima = lote.Item?.RangoTemperatura?.Minima,
        TemperaturaMaxima = lote.Item?.RangoTemperatura?.Maxima,
        TemperaturaDentroRango = lote.Item?.RangoTemperatura is null ? null :
            lote.TemperaturaMedida >= lote.Item.RangoTemperatura.Minima &&
            lote.TemperaturaMedida <= lote.Item.RangoTemperatura.Maxima,

        EstadoSensorial = lote.EstadoSensorial,
        EstadoRotulado = lote.EstadoRotulado,
        UbicacionDestino = lote.UbicacionDestino,
        Estado = lote.Estado,

        TieneDocumentosFaltantes = false,
        DocumentosFaltantes = new(),
        ObservacionesRecepcion = lote.Recepcion?.ObservacionesGenerales
    }).ToList();
}
}