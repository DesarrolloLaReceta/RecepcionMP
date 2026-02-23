using SistemaRecepcionMP.Application.Common.Mappings;
using AutoMapper;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Interfaces;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Queries;

public sealed class GetRecepcionesQuery : IRequest<IEnumerable<RecepcionResumenDto>>
{
    /// <summary>Filtro opcional por estado de la recepción.</summary>
    public EstadoRecepcion? Estado { get; set; }

    /// <summary>Filtro opcional por proveedor.</summary>
    public Guid? ProveedorId { get; set; }

    /// <summary>Rango de fechas — desde.</summary>
    public DateOnly? FechaDesde { get; set; }

    /// <summary>Rango de fechas — hasta.</summary>
    public DateOnly? FechaHasta { get; set; }
}

public sealed class GetRecepcionesQueryHandler
    : IRequestHandler<GetRecepcionesQuery, IEnumerable<RecepcionResumenDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetRecepcionesQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<RecepcionResumenDto>> Handle(
        GetRecepcionesQuery request,
        CancellationToken cancellationToken)
    {
        var recepciones = request.Estado.HasValue
            ? await _unitOfWork.Recepciones.GetByEstadoAsync(request.Estado.Value)
            : await _unitOfWork.Recepciones.GetAllAsync();

        if (request.ProveedorId.HasValue)
            recepciones = recepciones.Where(r => r.ProveedorId == request.ProveedorId.Value);

        if (request.FechaDesde.HasValue)
            recepciones = recepciones.Where(r => r.FechaRecepcion >= request.FechaDesde.Value);

        if (request.FechaHasta.HasValue)
            recepciones = recepciones.Where(r => r.FechaRecepcion <= request.FechaHasta.Value);

        return _mapper.Map<IEnumerable<RecepcionResumenDto>>(
            recepciones.OrderByDescending(r => r.FechaRecepcion));
    }
}