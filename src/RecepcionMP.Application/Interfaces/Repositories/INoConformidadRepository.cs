using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Application.Interfaces.Repositories;

public interface INoConformidadRepository
{
    Task<NoConformidad?> GetByIdAsync(int id);
    Task<IEnumerable<NoConformidad>> GetPorRecepcionAsync(int recepcionId);
    Task<IEnumerable<NoConformidad>> GetPorLoteAsync(int loteId);
    Task<IEnumerable<NoConformidad>> GetAbiertasAsync();
    Task<IEnumerable<NoConformidad>> GetPorEstadoAsync(EstadoNoConformidad estado);
    Task AddAsync(NoConformidad entity);
    Task UpdateAsync(NoConformidad entity);
    Task DeleteAsync(int id);
}
