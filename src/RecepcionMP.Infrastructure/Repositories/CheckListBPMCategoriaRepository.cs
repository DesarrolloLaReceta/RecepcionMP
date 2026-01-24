using Microsoft.EntityFrameworkCore;
using RecepcionMP.Application.Interfaces.Repositories;
using RecepcionMP.Domain.Entities;
using RecepcionMP.Infrastructure.Data;
using RecepcionMP.Infrastructure.Persistence;

namespace RecepcionMP.Infrastructure.Repositories;

public class CheckListBPMCategoriaRepository : ICheckListBPMCategoriaRepository
{
    private readonly ApplicationDbContext _context;

    public CheckListBPMCategoriaRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CheckListBPMCategoria?> GetByIdAsync(int id)
    {
        return await _context.CheckListsBPMCategorias
            .Include(c => c.Categoria)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<CheckListBPMCategoria?> GetVigentePorCategoriaAsync(int categoriaId)
    {
        return await _context.CheckListsBPMCategorias
            .Where(c => c.CategoriaId == categoriaId && c.EsVigente)
            .Include(c => c.Categoria)
            .OrderByDescending(c => c.FechaVigencia)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<CheckListBPMCategoria>> GetPorCategoriaAsync(int categoriaId)
    {
        return await _context.CheckListsBPMCategorias
            .Where(c => c.CategoriaId == categoriaId)
            .Include(c => c.Categoria)
            .OrderByDescending(c => c.Versión)
            .ToListAsync();
    }

    public async Task<IEnumerable<CheckListBPMCategoria>> GetTodasVigentesAsync()
    {
        return await _context.CheckListsBPMCategorias
            .Where(c => c.EsVigente)
            .Include(c => c.Categoria)
            .OrderByDescending(c => c.FechaVigencia)
            .ToListAsync();
    }

    public async Task AddAsync(CheckListBPMCategoria entity)
    {
        await _context.CheckListsBPMCategorias.AddAsync(entity);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(CheckListBPMCategoria entity)
    {
        _context.CheckListsBPMCategorias.Update(entity);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await GetByIdAsync(id);
        if (entity != null)
        {
            _context.CheckListsBPMCategorias.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}
