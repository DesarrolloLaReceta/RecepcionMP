using SistemaRecepcionMP.Application.Common.Mappings;
using AutoMapper;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Interfaces;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Dashboard;

// ─────────────────────────────────────────────────────────────────────────────
// KPI RECEPCIONES
// ─────────────────────────────────────────────────────────────────────────────

public sealed class GetKpiRecepcionesQuery : IRequest<KpiRecepcionesDto>
{
    /// <summary>Año a consultar. Por defecto el año actual.</summary>
    public int Año { get; set; } = DateTime.UtcNow.Year;

    /// <summary>Mes a consultar. Si es null devuelve el año completo.</summary>
    public int? Mes { get; set; }
}

public sealed class KpiRecepcionesDto
{
    public int TotalRecepciones { get; set; }
    public int Liberadas { get; set; }
    public int Rechazadas { get; set; }
    public int EnCuarentena { get; set; }
    public int Pendientes { get; set; }
    public decimal PorcentajeAprobacion { get; set; }
    public int TotalLotes { get; set; }
    public int LotesLiberados { get; set; }
    public int LotesRechazados { get; set; }
    public int LotesEnCuarentena { get; set; }
    public int NoConformidadesAbiertas { get; set; }
    public int AccionesCorrectivasVencidas { get; set; }
}

public sealed class GetKpiRecepcionesQueryHandler
    : IRequestHandler<GetKpiRecepcionesQuery, KpiRecepcionesDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetKpiRecepcionesQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<KpiRecepcionesDto> Handle(
        GetKpiRecepcionesQuery request,
        CancellationToken cancellationToken)
    {
        var todasRecepciones = await _unitOfWork.Recepciones.GetAllAsync();

        // Filtrar por período
        var recepciones = todasRecepciones.Where(r => r.CreadoEn.Year == request.Año);
        if (request.Mes.HasValue)
            recepciones = recepciones.Where(r => r.CreadoEn.Month == request.Mes.Value);

        var listaRecepciones = recepciones.ToList();

        // KPIs de recepciones
        var liberadas = listaRecepciones.Count(r => r.Estado == EstadoRecepcion.Liberada);
        var rechazadas = listaRecepciones.Count(r => r.Estado == EstadoRecepcion.Rechazada);

        // KPIs de lotes
        var todosLotes = await _unitOfWork.Lotes.GetAllAsync();
        var lotesPeriodo = todosLotes
            .Where(l => l.FechaRegistro.Year == request.Año)
            .ToList();

        if (request.Mes.HasValue)
            lotesPeriodo = lotesPeriodo
                .Where(l => l.FechaRegistro.Month == request.Mes.Value)
                .ToList();

        // KPIs de no conformidades
        var ncAbiertas = await _unitOfWork.NoConformidades.GetByEstadoAsync(EstadoNoConformidad.Abierta);
        var ncEnGestion = await _unitOfWork.NoConformidades.GetByEstadoAsync(EstadoNoConformidad.EnProceso);
        var hoy = DateOnly.FromDateTime(DateTime.UtcNow);

        var accionesVencidas = ncEnGestion
            .SelectMany(nc => nc.AccionesCorrectivas)
            .Count(a => a.Estado != EstadoAccionCorrectiva.Cerrada && a.FechaCompromiso < hoy);

        var totalLiberadas = listaRecepciones.Count > 0 ? liberadas : 0;
        var pctAprobacion = listaRecepciones.Count > 0
            ? Math.Round((decimal)totalLiberadas / listaRecepciones.Count * 100, 1)
            : 0;

        return new KpiRecepcionesDto
        {
            TotalRecepciones = listaRecepciones.Count,
            Liberadas = liberadas,
            Rechazadas = rechazadas,
            EnCuarentena = 0,
            Pendientes = listaRecepciones.Count(r =>
                r.Estado == EstadoRecepcion.Iniciada ||
                r.Estado == EstadoRecepcion.InspeccionVehiculo ||
                r.Estado == EstadoRecepcion.RegistroLotes),
            PorcentajeAprobacion = pctAprobacion,
            TotalLotes = lotesPeriodo.Count,
            LotesLiberados = lotesPeriodo.Count(l => l.Estado == EstadoLote.Liberado),
            LotesRechazados = lotesPeriodo.Count(l => 
                l.Estado == EstadoLote.RechazadoTotal ||
                l.Estado == EstadoLote.RechazadoParcial),
            LotesEnCuarentena = lotesPeriodo.Count(l => l.Estado == EstadoLote.EnCuarentena),
            NoConformidadesAbiertas = ncAbiertas.Count() + ncEnGestion.Count(),
            AccionesCorrectivasVencidas = accionesVencidas
        };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// VENCIMIENTOS PRÓXIMOS
// ─────────────────────────────────────────────────────────────────────────────

public sealed class GetVencimientosProximosQuery : IRequest<IEnumerable<VencimientoProximoDto>>
{
    /// <summary>Días de anticipación para alertar. Por defecto 30 días.</summary>
    public int DiasUmbral { get; set; } = 30;

    /// <summary>Si es true incluye los ya vencidos. Por defecto true.</summary>
    public bool IncluirVencidos { get; set; } = true;
}

public sealed class GetVencimientosProximosQueryHandler
    : IRequestHandler<GetVencimientosProximosQuery, IEnumerable<VencimientoProximoDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetVencimientosProximosQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<VencimientoProximoDto>> Handle(
        GetVencimientosProximosQuery request,
        CancellationToken cancellationToken)
    {
        var lotes = await _unitOfWork.Lotes.GetVencimientosProximosAsync(request.DiasUmbral);

        // Solo lotes activos (no rechazados ni ya liberados y consumidos)
        var lotesFiltrados = lotes
            .Where(l => l.Estado != EstadoLote.RechazadoTotal);

        if (!request.IncluirVencidos)
            lotesFiltrados = lotesFiltrados.Where(l => !l.VidaUtil.EstaVencido);

        return _mapper.Map<IEnumerable<VencimientoProximoDto>>(
            lotesFiltrados.OrderBy(l => l.VidaUtil.DiasRestantes));
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENTOS POR VENCER
// ─────────────────────────────────────────────────────────────────────────────

public sealed class GetDocumentosPorVencerDashboardQuery
    : IRequest<IEnumerable<DocumentoPorVencerDto>>
{
    /// <summary>Días de anticipación. Por defecto 30 días.</summary>
    public int DiasUmbral { get; set; } = 30;
}

public sealed class GetDocumentosPorVencerDashboardQueryHandler
    : IRequestHandler<GetDocumentosPorVencerDashboardQuery, IEnumerable<DocumentoPorVencerDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetDocumentosPorVencerDashboardQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<DocumentoPorVencerDto>> Handle(
        GetDocumentosPorVencerDashboardQuery request,
        CancellationToken cancellationToken)
    {
        var documentos = await _unitOfWork.Proveedores
            .GetDocumentosProximosAVencerAsync(request.DiasUmbral);

        return _mapper.Map<IEnumerable<DocumentoPorVencerDto>>(
            documentos.OrderBy(d => d.DiasParaVencer));
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPERATURAS FUERA DE RANGO
// ─────────────────────────────────────────────────────────────────────────────

public sealed class GetTemperaturasFueraDeRangoQuery
    : IRequest<IEnumerable<TemperaturaFueraRangoDto>>
{
    /// <summary>Filtra registros de las últimas N horas. Por defecto 24h.</summary>
    public int UltimasHoras { get; set; } = 24;

    /// <summary>Filtra por recepción específica si se indica.</summary>
    public Guid? RecepcionId { get; set; }
}

public sealed class GetTemperaturasFueraDeRangoQueryHandler
    : IRequestHandler<GetTemperaturasFueraDeRangoQuery, IEnumerable<TemperaturaFueraRangoDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetTemperaturasFueraDeRangoQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<TemperaturaFueraRangoDto>> Handle(
        GetTemperaturasFueraDeRangoQuery request,
        CancellationToken cancellationToken)
    {
        var registros = await _unitOfWork.Temperaturas.GetFueraDeRangoAsync();

        var desde = DateTime.UtcNow.AddHours(-request.UltimasHoras);
        var filtrados = registros.Where(t => t.FechaHora >= desde);

        if (request.RecepcionId.HasValue)
            filtrados = filtrados.Where(t => t.RecepcionId == request.RecepcionId.Value);

        return _mapper.Map<IEnumerable<TemperaturaFueraRangoDto>>(
            filtrados.OrderByDescending(t => t.FechaHora));
    }
}