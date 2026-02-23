using SistemaRecepcionMP.Application.Common.Mappings;
using AutoMapper;
using SistemaRecepcionMP.Domain.Exceptions.Proveedores;
using SistemaRecepcionMP.Domain.Interfaces;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Proveedores.Queries.GetProveedorById;

public sealed class GetProveedorByIdQueryHandler
    : IRequestHandler<GetProveedorByIdQuery, ProveedorDetalleDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetProveedorByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ProveedorDetalleDto> Handle(
        GetProveedorByIdQuery request,
        CancellationToken cancellationToken)
    {
        var proveedor = await _unitOfWork.Proveedores.GetWithDocumentosSanitariosAsync(request.Id)
            ?? throw new ProveedorNotFoundException(request.Id);

        return _mapper.Map<ProveedorDetalleDto>(proveedor);
    }
}