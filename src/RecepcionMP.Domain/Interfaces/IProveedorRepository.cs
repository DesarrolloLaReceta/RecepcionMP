using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Domain.Interfaces;

public interface IProveedorRepository
{
    Task<Proveedor?> ObtenerPorIdAsync(Guid id);
    Task CrearAsync(Proveedor proveedor);
}
