using SistemaRecepcionMP.Domain.Entities;

namespace SistemaRecepcionMP.Domain.Interfaces.Repositories;

public interface ICheckListBPMRepository : IRepository<ChecklistBPM>
{
    Task<ChecklistBPM?> GetActivoByCategoriaAsync(Guid categoriaId);
    Task<ChecklistBPM?> GetUltimaVersionAsync(Guid categoriaId);
    Task<IEnumerable<ChecklistBPM>> GetAllConItemsAsync();
    Task<ChecklistBPM?> GetByIdConItemsAsync(Guid id);

}