using Microsoft.EntityFrameworkCore;
using RecepcionMP.Application.Interfaces;
using RecepcionMP.Application.Interfaces.Repositories;
using RecepcionMP.Domain.Entities;
using RecepcionMP.Infrastructure.Persistence;

namespace RecepcionMP.Infrastructure.Repositories
{
    public class CategoriaRepository : ICategoriaRepository
    {
        private readonly ApplicationDbContext _context;

        public CategoriaRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Categoria> GetByIdAsync(int id)
        {
            return await _context.Categorias
                .Include(c => c.DocumentosRequeridos)
                .Include(c => c.CheckListsVersionados)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Categoria> GetByNombreAsync(string nombre)
        {
            return await _context.Categorias
                .FirstOrDefaultAsync(c => c.Nombre == nombre && c.Activo);
        }

        public async Task<IEnumerable<Categoria>> GetAllAsync()
        {
            return await _context.Categorias
                .Where(c => c.Activo)
                .OrderBy(c => c.Nombre)
                .ToListAsync();
        }

        public async Task<IEnumerable<DocumentoRequerido>> GetDocumentosRequeridosAsync(int categoriaId)
        {
            return await _context.DocumentosRequeridos
                .Where(d => d.CategoriaId == categoriaId && d.Activo)
                .OrderBy(d => d.EsObligatorio ? 0 : 1)
                .ToListAsync();
        }

        public async Task<CheckListBPMCategoria> GetCheckListVigenteAsync(int categoriaId)
        {
            return await _context.CheckListsBPMCategorias
                .Where(c => c.CategoriaId == categoriaId && c.EsVigente)
                .OrderByDescending(c => c.Versión)
                .FirstOrDefaultAsync();
        }

        public async Task AddAsync(Categoria categoria)
        {
            await _context.Categorias.AddAsync(categoria);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Categoria categoria)
        {
            _context.Categorias.Update(categoria);
            await _context.SaveChangesAsync();
        }
    }
}