using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Domain.Interfaces;

public interface IItemRepository
{
    Task<Item?> ObtenerPorIdAsync(Guid id);
}
