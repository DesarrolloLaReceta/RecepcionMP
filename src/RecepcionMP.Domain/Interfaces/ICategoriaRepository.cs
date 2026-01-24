using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Domain.Interfaces;

public interface ICategoriaRepository
{
    Task<IEnumerable<Categoria>> ObtenerTodasAsync();
    Task<Categoria?> ObtenerPorIdAsync(Guid id);
}
