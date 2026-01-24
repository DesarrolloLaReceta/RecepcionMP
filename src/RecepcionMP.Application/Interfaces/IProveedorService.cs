using System.Collections.Generic;
using System.Threading.Tasks;
using RecepcionMP.Application.DTOs.Proveedor;

namespace RecepcionMP.Application.Interfaces
{
    public interface IProveedorService
    {
        Task<int> CrearAsync(CreateProveedorDto dto);
        Task<ProveedorDto?> ObtenerPorIdAsync(int id);
        Task<IEnumerable<ProveedorDto>> ObtenerTodosActivosAsync();
        Task ActualizarAsync(int id, UpdateProveedorDto dto);
        Task<bool> ValidarHabilitacionesAsync(int proveedorId);
    }
}
