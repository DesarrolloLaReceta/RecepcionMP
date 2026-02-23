using SistemaRecepcionMP.Domain.Entities;

namespace SistemaRecepcionMP.Domain.Interfaces.Repositories;

public interface IItemRepository : IRepository<Item>
{
    Task<Item?> GetByCodigoInternoAsync(string codigo);
    Task<IEnumerable<Item>> GetByCategoriaAsync(Guid categoriaId);
}