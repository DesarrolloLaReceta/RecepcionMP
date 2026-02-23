using MediatR;
using SistemaRecepcionMP.Application.Common.Mappings;

namespace SistemaRecepcionMP.Application.Features.Proveedores.Queries.GetProveedorById;

public sealed class GetProveedorByIdQuery : IRequest<ProveedorDetalleDto>
{
    public Guid Id { get; set; }

    public GetProveedorByIdQuery(Guid id) => Id = id;
}