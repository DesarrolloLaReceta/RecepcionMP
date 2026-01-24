using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using RecepcionMP.Application.DTOs.Proveedor;
using RecepcionMP.Application.Interfaces;
using RecepcionMP.Domain.Interfaces;
using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Application.Services
{
    public class ProveedorService : IProveedorService
    {
        private readonly RecepcionMP.Application.Interfaces.Repositories.IProveedorRepository _repo;
        private readonly RecepcionMP.Application.Interfaces.Repositories.IAuditoriaRepository _audRepo;

        public ProveedorService(RecepcionMP.Application.Interfaces.Repositories.IProveedorRepository repo, RecepcionMP.Application.Interfaces.Repositories.IAuditoriaRepository audRepo)
        {
            _repo = repo;
            _audRepo = audRepo;
        }

        public async Task<int> CrearAsync(CreateProveedorDto dto)
        {
            var entidad = new Proveedor
            {
                RazonSocial = dto.RazonSocial,
                NIT = dto.NIT,
                Contacto = dto.Contacto
            };
            await _repo.AddAsync(entidad);
            return entidad.Id;
        }

        public async Task<ProveedorDto?> ObtenerPorIdAsync(int id)
        {
            var p = await _repo.GetByIdAsync(id);
            if (p == null) return null;
            return new ProveedorDto { Id = p.Id, RazonSocial = p.RazonSocial, NIT = p.NIT, Contacto = p.Contacto };
        }

        public async Task<IEnumerable<ProveedorDto>> ObtenerTodosActivosAsync()
        {
            var list = await _repo.GetAllActiveAsync();
            return list.Select(p => new ProveedorDto { Id = p.Id, RazonSocial = p.RazonSocial, NIT = p.NIT, Contacto = p.Contacto });
        }

        public async Task ActualizarAsync(int id, UpdateProveedorDto dto)
        {
            var entidad = await _repo.GetByIdAsync(id);
            if (entidad == null) throw new KeyNotFoundException("Proveedor no encontrado");
            entidad.RazonSocial = dto.RazonSocial;
            entidad.Contacto = dto.Contacto;
            await _repo.UpdateAsync(entidad);
        }

        public async Task<bool> ValidarHabilitacionesAsync(int proveedorId)
        {
            var p = await _repo.GetByIdAsync(proveedorId);
            if (p == null) return false;
            // simplificado: validar que exista al menos un DocumentoProveedor activo y vigente
            var doc = p.Documentos?.FirstOrDefault();
            return doc != null && (doc.FechaVigencia == null || doc.FechaVigencia > System.DateTime.UtcNow);
        }
    }
}
