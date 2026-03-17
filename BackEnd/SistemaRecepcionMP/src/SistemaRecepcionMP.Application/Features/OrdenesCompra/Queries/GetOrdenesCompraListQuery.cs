using AutoMapper;
using MediatR;
using SistemaRecepcionMP.Application.Common.Mappings;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Interfaces;


namespace SistemaRecepcionMP.Application.Features.OrdenesCompra.Queries;

public sealed class GetOrdenesCompraListQuery : IRequest<IEnumerable<OrdenCompraResumenDto>>
{
    public EstadoOrdenCompra? Estado { get; set; }
    public Guid? ProveedorId { get; set; }
}

public sealed class GetOrdenesCompraListQueryHandler 
    : IRequestHandler<GetOrdenesCompraListQuery, IEnumerable<OrdenCompraResumenDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetOrdenesCompraListQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<OrdenCompraResumenDto>> Handle(
        GetOrdenesCompraListQuery request, CancellationToken cancellationToken)
    {
        var ocs = await _unitOfWork.OrdenesCompra
            .GetAllConDetallesAsync(request.Estado, request.ProveedorId);

        return _mapper.Map<IEnumerable<OrdenCompraResumenDto>>(ocs);
    }
}