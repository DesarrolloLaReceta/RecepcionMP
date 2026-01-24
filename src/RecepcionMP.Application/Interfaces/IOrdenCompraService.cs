using System.Collections.Generic;
using System.Threading.Tasks;
using RecepcionMP.Application.DTOs.OrdenCompra;

namespace RecepcionMP.Application.Interfaces
{
    public interface IOrdenCompraService
    {
        Task<int> CrearAsync(CreateOrdenCompraDto dto);
        Task<List<ReadOrdenCompraDto>> ObtenerTodasAsync();
        Task<ReadOrdenCompraDto?> ObtenerPorIdAsync(int id);
        Task GetAllAsync();
    }
}
