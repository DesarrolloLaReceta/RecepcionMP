using System.Collections.Generic;
using System.Threading.Tasks;
using RecepcionMP.Application.DTOs.Item;

namespace RecepcionMP.Application.Interfaces
{
    public interface IItemService
    {
        Task<int> CrearAsync(CreateItemDto dto);
        Task<ItemDto?> ObtenerPorIdAsync(int id);
        Task<IEnumerable<ItemDto>> ObtenerPorCategoriaAsync(int categoriaId);
    }
}