using SistemaRecepcionMP.Application.Common.Mappings;
using AutoMapper;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Exceptions.Proveedores;
using SistemaRecepcionMP.Domain.Interfaces;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.OrdenesCompra.Queries;

public sealed class GetOCByProveedorQuery : IRequest<IEnumerable<OrdenCompraResumenDto>>
{
    public Guid ProveedorId { get; set; }

    /// <summary>
    /// Filtro opcional por estado. Si es null devuelve todas.
    /// </summary>
    public EstadoOrdenCompra? Estado { get; set; }

    public GetOCByProveedorQuery(Guid proveedorId, EstadoOrdenCompra? estado = null)
    {
        ProveedorId = proveedorId;
        Estado = estado;
    }
}

public sealed class GetOCByProveedorQueryHandler
    : IRequestHandler<GetOCByProveedorQuery, IEnumerable<OrdenCompraResumenDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetOCByProveedorQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<OrdenCompraResumenDto>> Handle(
        GetOCByProveedorQuery request,
        CancellationToken cancellationToken)
    {
        // Verificar que el proveedor existe
        var proveedor = await _unitOfWork.Proveedores.GetByIdAsync(request.ProveedorId)
            ?? throw new ProveedorNotFoundException(request.ProveedorId);

        var ordenes = await _unitOfWork.OrdenesCompra.GetByProveedorAsync(request.ProveedorId);

        if (request.Estado.HasValue)
            ordenes = ordenes.Where(oc => oc.Estado == request.Estado.Value);

        return _mapper.Map<IEnumerable<OrdenCompraResumenDto>>(ordenes);
    }
}