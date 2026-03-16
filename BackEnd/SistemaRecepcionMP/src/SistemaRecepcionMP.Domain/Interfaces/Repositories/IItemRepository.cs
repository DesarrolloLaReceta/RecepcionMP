using SistemaRecepcionMP.Domain.Entities;

namespace SistemaRecepcionMP.Domain.Interfaces.Repositories;

public interface IItemRepository : IRepository<Item>
{
    Task<Item?> GetByCodigoInternoAsync(string codigo);
    Task<IEnumerable<Item>> GetByCategoriaAsync(Guid categoriaId);
    Task<IEnumerable<CategoriaItem>> GetCategoriasAsync();
    Task<IEnumerable<Item>> GetAllConCategoriaAsync();
}