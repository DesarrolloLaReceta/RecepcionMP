using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Application.Interfaces.Repositories
{
    public interface ICategoriaRepository
    {
        Task<Categoria> GetByIdAsync(int id);
        Task<Categoria> GetByNombreAsync(string nombre);
        Task<IEnumerable<Categoria>> GetAllAsync();
        Task<IEnumerable<DocumentoRequerido>> GetDocumentosRequeridosAsync(int categoriaId);
        Task<CheckListBPMCategoria> GetCheckListVigenteAsync(int categoriaId);
        Task AddAsync(Categoria categoria);
        Task UpdateAsync(Categoria categoria);
    }
}