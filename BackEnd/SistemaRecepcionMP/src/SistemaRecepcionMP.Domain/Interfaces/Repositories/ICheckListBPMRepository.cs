using SistemaRecepcionMP.Domain.Entities;

namespace SistemaRecepcionMP.Domain.Interfaces.Repositories;

public interface ICheckListBPMRepository : IRepository<ChecklistBPM>
{
    Task<ChecklistBPM?> GetActivoByCategoriaAsync(Guid categoriaId);
    Task<ChecklistBPM?> GetUltimaVersionAsync(Guid categoriaId);
    Task<bool> ExisteAsync(Guid id);
    Task<IEnumerable<ChecklistBPM>> GetAllConItemsAsync();
    Task<ChecklistBPM?> GetByIdConItemsAsync(Guid id);
    Task RemoverItemsAsync(Guid checklistId);
    Task AgregarItemsAsync(List<ItemChecklist> items);
    Task<bool> TieneResultadosAsync(Guid checklistId);
    Task EliminarAsync(Guid id);
    Task<bool> ExisteItemsAsync(Guid checklistId);

}