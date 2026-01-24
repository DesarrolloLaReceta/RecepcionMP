using RecepcionMP.Domain.Entities;
using System.Collections.Generic;

namespace RecepcionMP.Application.Interfaces.Repositories
{
    public interface IItemRepository
    {
        Task AddAsync(Item item);
        Task<Item?> GetByIdAsync(int id);
        Task<IEnumerable<Item>> GetByCategoriaAsync(int categoriaId);
    }
}
