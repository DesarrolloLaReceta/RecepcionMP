using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Domain.Interfaces.Repositories;

public interface IOrdenCompraRepository : IRepository<OrdenCompra>
{
    Task<OrdenCompra?> GetByNumeroOCAsync(string numeroOC);
    Task<IEnumerable<OrdenCompra>> GetAbiertasAsync();
    Task<IEnumerable<OrdenCompra>> GetByProveedorAsync(Guid proveedorId);
    Task<IEnumerable<OrdenCompra>> GetAllConDetallesAsync(
        EstadoOrdenCompra? estado = null,
        Guid? proveedorId = null);
}