using SistemaRecepcionMP.Application.Common.Mappings;
using AutoMapper;
using SistemaRecepcionMP.Domain.Interfaces;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Proveedores.Queries.GetProveedoresList;

public sealed class GetProveedoresListQueryHandler
    : IRequestHandler<GetProveedoresListQuery, IEnumerable<ProveedorResumenDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetProveedoresListQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ProveedorResumenDto>> Handle(
        GetProveedoresListQuery request,
        CancellationToken cancellationToken)
    {
        var proveedores = await _unitOfWork.Proveedores.GetAllAsync();

        if (request.SoloActivos)
            proveedores = proveedores.Where(p => p.Estado);

        return _mapper.Map<IEnumerable<ProveedorResumenDto>>(proveedores);
    }
}