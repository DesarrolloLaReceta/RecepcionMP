using SistemaRecepcionMP.Application.Common.Mappings;
using AutoMapper;
using SistemaRecepcionMP.Domain.Exceptions.OrdenesCompra;
using SistemaRecepcionMP.Domain.Interfaces;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.OrdenesCompra.Queries;

public sealed class GetOrdenCompraByIdQuery : IRequest<OrdenCompraDetalleDto>
{
    public Guid Id { get; set; }
    public GetOrdenCompraByIdQuery(Guid id) => Id = id;
}

public sealed class GetOrdenCompraByIdQueryHandler
    : IRequestHandler<GetOrdenCompraByIdQuery, OrdenCompraDetalleDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetOrdenCompraByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<OrdenCompraDetalleDto> Handle(
        GetOrdenCompraByIdQuery request,
        CancellationToken cancellationToken)
    {
        var oc = await _unitOfWork.OrdenesCompra.GetByIdAsync(request.Id)
            ?? throw new OrdenCompraNotFoundException(request.Id);

        return _mapper.Map<OrdenCompraDetalleDto>(oc);
    }
}