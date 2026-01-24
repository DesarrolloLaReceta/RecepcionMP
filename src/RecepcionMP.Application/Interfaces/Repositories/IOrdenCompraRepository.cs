using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Application.Interfaces.Repositories
{
    public interface IOrdenCompraRepository
    {
        Task<OrdenCompra?> GetByIdAsync(int id);
        Task<OrdenCompra?> GetByNumeroAsync(string numeroOrden);
        Task<List<OrdenCompra>> GetAllAsync();
        Task AddAsync(OrdenCompra ordenCompra);
        Task UpdateAsync(OrdenCompra ordenCompra);
    }
}
