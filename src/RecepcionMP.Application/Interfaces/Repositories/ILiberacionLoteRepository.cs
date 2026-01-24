using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Application.Interfaces.Repositories;

public interface ILiberacionLoteRepository
{
    Task<LiberacionLote?> GetByIdAsync(int id);
    Task<LiberacionLote?> GetPorLoteAsync(int loteId);
    Task<IEnumerable<LiberacionLote>> GetPorRecepcionAsync(int recepcionId);
    Task<IEnumerable<LiberacionLote>> GetPorEstadoAsync(EstadoLiberacion estado);
    Task<IEnumerable<LiberacionLote>> GetPendientesAsync();
    Task AddAsync(LiberacionLote entity);
    Task UpdateAsync(LiberacionLote entity);
    Task DeleteAsync(int id);
}
