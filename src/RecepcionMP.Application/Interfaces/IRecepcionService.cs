using RecepcionMP.Application.DTOs;

namespace RecepcionMP.Application.Interfaces;

public interface IRecepcionService
{
    Task<int> CrearAsync(CreateRecepcionDto dto);
    Task<RecepcionDto?> ObtenerPorIdAsync(int id);
    Task<IEnumerable<RecepcionDto>> ObtenerTodosAsync();
}
