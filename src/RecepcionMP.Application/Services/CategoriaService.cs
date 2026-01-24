using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using RecepcionMP.Application.DTOs.Categoria;
using RecepcionMP.Application.Interfaces;
using RecepcionMP.Domain.Interfaces;
using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Application.Services
{
    public class CategoriaService : ICategoriaService
    {
        private readonly RecepcionMP.Application.Interfaces.Repositories.ICategoriaRepository _repo;

        public CategoriaService(RecepcionMP.Application.Interfaces.Repositories.ICategoriaRepository repo)
        {
            _repo = repo;
        }

        public async Task<int> CrearAsync(CreateCategoriaDto dto)
        {
            var entidad = new Categoria
            {
                Nombre = dto.Nombre,
                Descripcion = dto.Descripcion,
                TipoAlimento = (TipoAlimento)dto.TipoAlimento
            };
            await _repo.AddAsync(entidad);
            return entidad.Id;
        }

        public async Task<CategoriaDto?> ObtenerPorIdAsync(int id)
        {
            var c = await _repo.GetByIdAsync(id);
            if (c == null) return null;
            return new CategoriaDto
            {
                Id = c.Id,
                Nombre = c.Nombre,
                Descripcion = c.Descripcion,
                TipoAlimento = c.TipoAlimento.ToString(),
                DocumentosRequeridos = c.DocumentosRequeridos.Select(d => new RecepcionMP.Application.DTOs.Documento.DocumentoRequeridoDto
                {
                    Id = d.Id,
                    CategoriaId = d.CategoriaId,
                    Nombre = d.Nombre,
                    TipoDocumento = d.TipoDocumento.ToString(),
                    EsObligatorio = d.EsObligatorio,
                    VigenciaDias = d.VigenciaDias
                }).ToList()
            };
        }

        public async Task<IEnumerable<CategoriaDto>> ObtenerTodasAsync()
        {
            var lista = await _repo.GetAllAsync();
            return lista.Select(c => new CategoriaDto { Id = c.Id, Nombre = c.Nombre, Descripcion = c.Descripcion, TipoAlimento = c.TipoAlimento.ToString() });
        }
    }
}