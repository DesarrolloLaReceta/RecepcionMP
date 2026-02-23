using SistemaRecepcionMP.Application.Common.Mappings;
using AutoMapper;
using SistemaRecepcionMP.Domain.Interfaces;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.OrdenesCompra.Queries;

public sealed class GetOrdenesAbiertasQuery : IRequest<IEnumerable<OrdenCompraResumenDto>>
{
    /// <summary>
    /// Si se indica, filtra las OC abiertas del proveedor específico.
    /// Útil en el paso de pre-recepción para buscar OC disponibles.
    /// </summary>
    public Guid? ProveedorId { get; set; }
}

public sealed class GetOrdenesAbiertasQueryHandler
    : IRequestHandler<GetOrdenesAbiertasQuery, IEnumerable<OrdenCompraResumenDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetOrdenesAbiertasQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<OrdenCompraResumenDto>> Handle(
        GetOrdenesAbiertasQuery request,
        CancellationToken cancellationToken)
    {
        var ordenes = await _unitOfWork.OrdenesCompra.GetAbiertasAsync();

        if (request.ProveedorId.HasValue)
            ordenes = ordenes.Where(oc => oc.ProveedorId == request.ProveedorId.Value);

        return _mapper.Map<IEnumerable<OrdenCompraResumenDto>>(ordenes);
    }
}