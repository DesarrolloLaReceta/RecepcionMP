using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Application.Interfaces.Repositories;

public interface ICheckListBPMCategoriaRepository
{
    Task<CheckListBPMCategoria?> GetByIdAsync(int id);
    Task<CheckListBPMCategoria?> GetVigentePorCategoriaAsync(int categoriaId);
    Task<IEnumerable<CheckListBPMCategoria>> GetPorCategoriaAsync(int categoriaId);
    Task<IEnumerable<CheckListBPMCategoria>> GetTodasVigentesAsync();
    Task AddAsync(CheckListBPMCategoria entity);
    Task UpdateAsync(CheckListBPMCategoria entity);
    Task DeleteAsync(int id);
}
