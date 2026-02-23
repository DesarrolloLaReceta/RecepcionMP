using SistemaRecepcionMP.Application.Common.Mappings;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Proveedores.Queries.GetProveedoresList;

public sealed class GetProveedoresListQuery : IRequest<IEnumerable<ProveedorResumenDto>>
{
    /// <summary>
    /// Si es true devuelve solo proveedores activos.
    /// Si es false devuelve todos.
    /// </summary>
    public bool SoloActivos { get; set; } = true;
}