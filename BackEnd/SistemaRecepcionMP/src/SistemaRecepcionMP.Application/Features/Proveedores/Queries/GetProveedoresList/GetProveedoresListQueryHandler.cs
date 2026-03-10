using SistemaRecepcionMP.Application.Common.Mappings;
using SistemaRecepcionMP.Domain.Enums;
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
            proveedores = proveedores.Where(p => p.Estado == EstadoProveedor.Activo);

        var lista = proveedores.ToList();
        var dtos  = _mapper.Map<List<ProveedorResumenDto>>(lista);

        for (int i = 0; i < lista.Count; i++)
        {
            dtos[i].Categorias       = ProveedorCalculos.Categorias(lista[i]);
            dtos[i].TotalRecepciones = ProveedorCalculos.TotalRecepciones(lista[i]);
            dtos[i].TasaAceptacion   = ProveedorCalculos.TasaAceptacion(lista[i]);
        }

        return dtos;
    }
}