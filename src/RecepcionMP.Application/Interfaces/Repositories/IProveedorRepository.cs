using RecepcionMP.Domain.Entities;
namespace RecepcionMP.Application.Interfaces.Repositories
{
    public interface IProveedorRepository
    {
        Task<Proveedor> GetByIdAsync(int id);
        Task<Proveedor> GetByNITAsync(string nit);
        Task<IEnumerable<Proveedor>> GetAllActiveAsync();
        Task<IEnumerable<Proveedor>> GetPorCategoriaAsync(int categoriaId); // Proveedores de una categoría
        Task AddAsync(Proveedor proveedor);
        Task UpdateAsync(Proveedor proveedor);
        Task<bool> ExisteAsync(int id);
        Task<int> ObtenerCantidadRecepcionesAsync(int proveedorId, DateTime desde, DateTime hasta);
    }
}
