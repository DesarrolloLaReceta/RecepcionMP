using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Application.Interfaces.Repositories;

public interface IAccionCorrectivaRepository
{
    Task<AccionCorrectiva?> GetByIdAsync(int id);
    Task<IEnumerable<AccionCorrectiva>> GetPorNoConformidadAsync(int noConformidadId);
    Task<IEnumerable<AccionCorrectiva>> GetAbiertasAsync();
    Task<IEnumerable<AccionCorrectiva>> GetVencidasAsync();
    Task<IEnumerable<AccionCorrectiva>> GetPorEstadoAsync(EstadoAccionCorrectiva estado);
    Task<IEnumerable<AccionCorrectiva>> GetPorResponsableAsync(string usuarioId);
    Task AddAsync(AccionCorrectiva entity);
    Task UpdateAsync(AccionCorrectiva entity);
    Task DeleteAsync(int id);
}
