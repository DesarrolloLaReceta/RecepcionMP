using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Application.Interfaces.Repositories;

public interface ILoteRepository
{
    Task<Lote?> GetByIdAsync(int id);
    Task<IEnumerable<Lote>> GetPorRecepcionAsync(int recepcionId);
    Task<IEnumerable<Lote>> GetPorItemAsync(int itemId);
    Task<IEnumerable<Lote>> GetTodosAsync();
    Task AddAsync(Lote entity);
    Task UpdateAsync(Lote entity);
    Task DeleteAsync(int id);
}
