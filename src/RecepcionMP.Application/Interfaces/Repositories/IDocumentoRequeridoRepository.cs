using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Application.Interfaces.Repositories
{
    public interface IDocumentoRequeridoRepository
    {
        Task<DocumentoRequerido> GetByIdAsync(int id);
        Task<IEnumerable<DocumentoRequerido>> GetPorCategoriaAsync(int categoriaId);
        Task<IEnumerable<DocumentoRequerido>> GetObligatoriosPorCategoriaAsync(int categoriaId);
        Task AddAsync(DocumentoRequerido documento);
        Task UpdateAsync(DocumentoRequerido documento);
        Task CrearVersionAsync(DocumentoRequerido documentoAnterior); // Para versionado
    }
}