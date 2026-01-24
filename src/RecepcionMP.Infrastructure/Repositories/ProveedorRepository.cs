using Microsoft.EntityFrameworkCore;
using RecepcionMP.Application.Interfaces;
using RecepcionMP.Application.Interfaces.Repositories;
using RecepcionMP.Domain.Entities;
using RecepcionMP.Infrastructure.Persistence;

namespace RecepcionMP.Infrastructure.Repositories
{
    public class ProveedorRepository : IProveedorRepository
    {
        private readonly ApplicationDbContext _context;

        public ProveedorRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Proveedor> GetByIdAsync(int id)
        {
            return await _context.Proveedores
                .Include(p => p.Documentos)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Proveedor> GetByNITAsync(string nit)
        {
            return await _context.Proveedores
                .Include(p => p.Documentos)
                .FirstOrDefaultAsync(p => p.NIT == nit);
        }

        public async Task<IEnumerable<Proveedor>> GetAllActiveAsync()
        {
            return await _context.Proveedores
                .Where(p => p.Activo)
                .OrderBy(p => p.RazonSocial)
                .ToListAsync();
        }

        public async Task<IEnumerable<Proveedor>> GetPorCategoriaAsync(int categoriaId)
        {
            return await _context.Proveedores
                .Where(p => p.Activo && p.Items.Any(i => i.CategoriaId == categoriaId))
                .OrderBy(p => p.RazonSocial)
                .ToListAsync();
        }

        public async Task AddAsync(Proveedor proveedor)
        {
            await _context.Proveedores.AddAsync(proveedor);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Proveedor proveedor)
        {
            _context.Proveedores.Update(proveedor);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExisteAsync(int id)
        {
            return await _context.Proveedores.AnyAsync(p => p.Id == id);
        }

        public async Task<int> ObtenerCantidadRecepcionesAsync(int proveedorId, DateTime desde, DateTime hasta)
        {
            return await _context.Recepciones
                .Where(r => r.ProveedorId == proveedorId 
                    && r.FechaRecepcion >= desde 
                    && r.FechaRecepcion <= hasta)
                .CountAsync();
        }
    }
}
