using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using RecepcionMP.Application.DTOs.Item;
using RecepcionMP.Application.Interfaces;
using RecepcionMP.Application.Interfaces.Repositories;
using RecepcionMP.Domain.Interfaces;
using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Application.Services
{
    public class ItemService : IItemService
    {
        private readonly RecepcionMP.Application.Interfaces.Repositories.IItemRepository _repo;

        public ItemService(RecepcionMP.Application.Interfaces.Repositories.IItemRepository repo)
        {
            _repo = repo;
        }

        public async Task<int> CrearAsync(CreateItemDto dto)
        {
            var entidad = new Item
            {
                Nombre = dto.Nombre,
                CategoriaId = dto.CategoriaId,
                UnidadMedida = dto.UnidadMedida,
                VidaUtilDias = dto.VidaUtilDias,
                TemperaturaObjetivo = dto.TemperaturaObjetivo
            };
            await _repo.AddAsync(entidad);
            return entidad.Id;
        }

        public async Task<ItemDto?> ObtenerPorIdAsync(int id)
        {
            var i = await _repo.GetByIdAsync(id);
            if (i == null) return null;
            return new ItemDto
            {
                Id = i.Id,
                Nombre = i.Nombre,
                CategoriaId = i.CategoriaId,
                UnidadMedida = i.UnidadMedida,
                VidaUtilDias = i.VidaUtilDias,
                TemperaturaObjetivo = i.TemperaturaObjetivo
            };
        }

        public async Task<IEnumerable<ItemDto>> ObtenerPorCategoriaAsync(int categoriaId)
        {
            var lista = await _repo.GetByCategoriaAsync(categoriaId);
            return lista.Select(i => new ItemDto { Id = i.Id, Nombre = i.Nombre, CategoriaId = i.CategoriaId, UnidadMedida = i.UnidadMedida, VidaUtilDias = i.VidaUtilDias, TemperaturaObjetivo = i.TemperaturaObjetivo });
        }
    }
}