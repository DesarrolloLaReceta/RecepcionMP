using Microsoft.EntityFrameworkCore;
using RecepcionMP.Application.Interfaces.Repositories;
using RecepcionMP.Domain.Entities;
using RecepcionMP.Infrastructure.Data;
using RecepcionMP.Infrastructure.Persistence;

namespace RecepcionMP.Infrastructure.Repositories;

public class NoConformidadRepository : INoConformidadRepository
{
    private readonly ApplicationDbContext _context;

    public NoConformidadRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<NoConformidad?> GetByIdAsync(int id)
    {
        return await _context.NoConformidades
            .Include(n => n.Recepcion)
            .Include(n => n.Lote)
            .Include(n => n.AccionesCorrectivas)
            .FirstOrDefaultAsync(n => n.Id == id);
    }

    public async Task<IEnumerable<NoConformidad>> GetPorRecepcionAsync(int recepcionId)
    {
        return await _context.NoConformidades
            .Where(n => n.RecepcionId == recepcionId)
            .Include(n => n.Lote)
            .Include(n => n.AccionesCorrectivas)
            .OrderByDescending(n => n.FechaRegistro)
            .ToListAsync();
    }

    public async Task<IEnumerable<NoConformidad>> GetPorLoteAsync(int loteId)
    {
        return await _context.NoConformidades
            .Where(n => n.LoteId == loteId)
            .Include(n => n.AccionesCorrectivas)
            .OrderByDescending(n => n.FechaRegistro)
            .ToListAsync();
    }

    public async Task<IEnumerable<NoConformidad>> GetAbiertasAsync()
    {
        return await _context.NoConformidades
            .Where(n => n.Estado == EstadoNoConformidad.Abierta)
            .Include(n => n.Recepcion)
            .Include(n => n.Lote)
            .Include(n => n.AccionesCorrectivas)
            .OrderByDescending(n => n.FechaRegistro)
            .ToListAsync();
    }

    public async Task<IEnumerable<NoConformidad>> GetPorEstadoAsync(EstadoNoConformidad estado)
    {
        return await _context.NoConformidades
            .Where(n => n.Estado == estado)
            .Include(n => n.Recepcion)
            .Include(n => n.Lote)
            .OrderByDescending(n => n.FechaRegistro)
            .ToListAsync();
    }

    public async Task AddAsync(NoConformidad entity)
    {
        await _context.NoConformidades.AddAsync(entity);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(NoConformidad entity)
    {
        _context.NoConformidades.Update(entity);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await GetByIdAsync(id);
        if (entity != null)
        {
            _context.NoConformidades.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}
