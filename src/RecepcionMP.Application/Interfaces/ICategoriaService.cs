using System.Collections.Generic;
using System.Threading.Tasks;
using RecepcionMP.Application.DTOs.Categoria;

namespace RecepcionMP.Application.Interfaces
{
    public interface ICategoriaService
    {
        Task<int> CrearAsync(CreateCategoriaDto dto);
        Task<CategoriaDto?> ObtenerPorIdAsync(int id);
        Task<IEnumerable<CategoriaDto>> ObtenerTodasAsync();
    }
}