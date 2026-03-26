using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Domain.Interfaces.Repositories;

public interface IRecepcionRepository : IRepository<Recepcion>
{
    Task<Recepcion?> GetByNumeroRecepcionAsync(string numero);
    Task<IEnumerable<Recepcion>> GetByEstadoAsync(EstadoRecepcion estado);
    Task<Recepcion?> GetWithLotesAsync(Guid id);
    Task<IEnumerable<Recepcion>> GetByProveedorAsync(Guid proveedorId);
    Task UpdateAsync(Recepcion recepcion);
    Task<Recepcion?> GetWithItemsAndLotesAsync(Guid id);
    Task<bool> ExisteRecepcionActivaPorOrdenCompra(Guid ordenCompraId);
}