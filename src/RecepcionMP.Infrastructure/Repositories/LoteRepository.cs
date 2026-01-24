using Microsoft.EntityFrameworkCore;
using RecepcionMP.Application.Interfaces.Repositories;
using RecepcionMP.Domain.Entities;
using RecepcionMP.Infrastructure.Data;
using RecepcionMP.Infrastructure.Persistence;

namespace RecepcionMP.Infrastructure.Repositories;

public class LoteRepository : ILoteRepository
{
    private readonly ApplicationDbContext _context;

    public LoteRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Lote?> GetByIdAsync(int id)
    {
        return await _context.Lotes
            .Include(l => l.Recepcion)
            .Include(l => l.Item)
            .FirstOrDefaultAsync(l => l.Id == id);
    }

    public async Task<IEnumerable<Lote>> GetPorRecepcionAsync(int recepcionId)
    {
        return await _context.Lotes
            .Where(l => l.RecepcionId == recepcionId)
            .Include(l => l.Item)
            .OrderBy(l => l.NumeroLote)
            .ToListAsync();
    }

    public async Task<IEnumerable<Lote>> GetPorItemAsync(int itemId)
    {
        return await _context.Lotes
            .Where(l => l.ItemId == itemId)
            .Include(l => l.Recepcion)
            .OrderBy(l => l.NumeroLote)
            .ToListAsync();
    }

    public async Task<IEnumerable<Lote>> GetTodosAsync()
    {
        return await _context.Lotes
            .Include(l => l.Recepcion)
            .Include(l => l.Item)
            .ToListAsync();
    }

    public async Task AddAsync(Lote entity)
    {
        await _context.Lotes.AddAsync(entity);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Lote entity)
    {
        _context.Lotes.Update(entity);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await GetByIdAsync(id);
        if (entity != null)
        {
            _context.Lotes.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}
