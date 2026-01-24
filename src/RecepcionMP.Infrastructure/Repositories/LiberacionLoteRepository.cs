using Microsoft.EntityFrameworkCore;
using RecepcionMP.Application.Interfaces.Repositories;
using RecepcionMP.Domain.Entities;
using RecepcionMP.Infrastructure.Data;
using RecepcionMP.Infrastructure.Persistence;

namespace RecepcionMP.Infrastructure.Repositories;

public class LiberacionLoteRepository : ILiberacionLoteRepository
{
    private readonly ApplicationDbContext _context;

    public LiberacionLoteRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<LiberacionLote?> GetByIdAsync(int id)
    {
        return await _context.LiberacionesLotes
            .Include(l => l.Lote)
            .Include(l => l.Recepcion)
            .FirstOrDefaultAsync(l => l.Id == id);
    }

    public async Task<LiberacionLote?> GetPorLoteAsync(int loteId)
    {
        return await _context.LiberacionesLotes
            .Include(l => l.Lote)
            .Include(l => l.Recepcion)
            .FirstOrDefaultAsync(l => l.LoteId == loteId);
    }

    public async Task<IEnumerable<LiberacionLote>> GetPorRecepcionAsync(int recepcionId)
    {
        return await _context.LiberacionesLotes
            .Where(l => l.RecepcionId == recepcionId)
            .Include(l => l.Lote)
            .OrderByDescending(l => l.FechaDecision)
            .ToListAsync();
    }

    public async Task<IEnumerable<LiberacionLote>> GetPorEstadoAsync(EstadoLiberacion estado)
    {
        return await _context.LiberacionesLotes
            .Where(l => l.Estado == estado)
            .Include(l => l.Lote)
            .Include(l => l.Recepcion)
            .OrderByDescending(l => l.FechaDecision)
            .ToListAsync();
    }

    public async Task<IEnumerable<LiberacionLote>> GetPendientesAsync()
    {
        return await _context.LiberacionesLotes
            .Where(l => l.Estado == EstadoLiberacion.Pendiente)
            .Include(l => l.Lote)
            .Include(l => l.Recepcion)
            .OrderBy(l => l.FechaDecision)
            .ToListAsync();
    }

    public async Task AddAsync(LiberacionLote entity)
    {
        await _context.LiberacionesLotes.AddAsync(entity);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(LiberacionLote entity)
    {
        _context.LiberacionesLotes.Update(entity);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await GetByIdAsync(id);
        if (entity != null)
        {
            _context.LiberacionesLotes.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}
