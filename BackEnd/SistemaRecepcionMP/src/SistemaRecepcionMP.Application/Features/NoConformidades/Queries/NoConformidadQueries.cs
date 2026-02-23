using SistemaRecepcionMP.Application.Common.Exceptions;
using SistemaRecepcionMP.Application.Common.Mappings;
using AutoMapper;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Interfaces;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.NoConformidades.Queries;

// ─── GetNoConformidadesByLote ─────────────────────────────────────────────────

public sealed class GetNoConformidadesByLoteQuery
    : IRequest<IEnumerable<NoConformidadDetalleDto>>
{
    public Guid LoteRecibidoId { get; set; }
    public GetNoConformidadesByLoteQuery(Guid loteRecibidoId) => LoteRecibidoId = loteRecibidoId;
}

public sealed class GetNoConformidadesByLoteQueryHandler
    : IRequestHandler<GetNoConformidadesByLoteQuery, IEnumerable<NoConformidadDetalleDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetNoConformidadesByLoteQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<NoConformidadDetalleDto>> Handle(
        GetNoConformidadesByLoteQuery request,
        CancellationToken cancellationToken)
    {
        var lote = await _unitOfWork.Lotes.GetByIdAsync(request.LoteRecibidoId)
            ?? throw new ValidationException("LoteRecibidoId",
                $"No se encontró el lote con ID '{request.LoteRecibidoId}'.");

        var noConformidades = (await _unitOfWork.NoConformidades.GetAllAsync())
            .Where(nc => nc.LoteRecibidoId == lote.Id)
            .OrderByDescending(nc => nc.CreadoEn);

        return _mapper.Map<IEnumerable<NoConformidadDetalleDto>>(noConformidades);
    }
}

// ─── GetNoConformidadesAbiertas ───────────────────────────────────────────────

public sealed class GetNoConformidadesAbiertasQuery
    : IRequest<IEnumerable<NoConformidadResumenDto>>
{
    /// <summary>
    /// Filtra por tipo de no conformidad. Si es null devuelve todas las abiertas.
    /// </summary>
    public TipoNoConformidad? Tipo { get; set; }

    /// <summary>
    /// Si es true, devuelve solo las que tienen acciones correctivas vencidas.
    /// </summary>
    public bool SoloConAccionesVencidas { get; set; } = false;
}

public sealed class GetNoConformidadesAbiertasQueryHandler
    : IRequestHandler<GetNoConformidadesAbiertasQuery, IEnumerable<NoConformidadResumenDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetNoConformidadesAbiertasQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<NoConformidadResumenDto>> Handle(
        GetNoConformidadesAbiertasQuery request,
        CancellationToken cancellationToken)
    {
        var noConformidades = await _unitOfWork.NoConformidades
            .GetByEstadoAsync(EstadoNoConformidad.Abierta);

        // Incluir también las que están en gestión
        var enGestion = await _unitOfWork.NoConformidades
            .GetByEstadoAsync(EstadoNoConformidad.EnProceso);

        var todas = noConformidades.Concat(enGestion);

        if (request.Tipo.HasValue)
            todas = todas.Where(nc => nc.Tipo == request.Tipo.Value);

        if (request.SoloConAccionesVencidas)
        {
            var hoy = DateOnly.FromDateTime(DateTime.UtcNow);
            todas = todas.Where(nc =>
                nc.AccionesCorrectivas.Any(a =>
                    a.Estado != EstadoAccionCorrectiva.Cerrada &&
                    a.FechaCompromiso < hoy));
        }

        return _mapper.Map<IEnumerable<NoConformidadResumenDto>>(
            todas.OrderByDescending(nc => nc.CreadoEn));
    }
}