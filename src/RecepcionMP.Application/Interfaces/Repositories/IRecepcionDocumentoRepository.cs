using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Application.Interfaces
{
    public interface IRecepcionDocumentoRepository
    {
        Task<RecepcionDocumento> GetByIdAsync(int id);
        Task<IEnumerable<RecepcionDocumento>> GetPorRecepcionAsync(int recepcionId);
        Task<IEnumerable<RecepcionDocumento>> GetPorTipoDocumentoAsync(int documentoRequeridoId);
        Task AddAsync(RecepcionDocumento documento);
        Task UpdateAsync(RecepcionDocumento documento);
        Task EliminarAsync(int id);
    }
}