using Microsoft.EntityFrameworkCore;
using RecepcionMP.Application.Interfaces.Repositories;
using RecepcionMP.Domain.Entities;
using RecepcionMP.Infrastructure.Data;
using RecepcionMP.Infrastructure.Persistence;

namespace RecepcionMP.Infrastructure.Repositories;

public class AccionCorrectivaRepository : IAccionCorrectivaRepository
{
    private readonly ApplicationDbContext _context;

    public AccionCorrectivaRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AccionCorrectiva?> GetByIdAsync(int id)
    {
        return await _context.AccionesCorrectivas
            .Include(a => a.NoConformidad)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<IEnumerable<AccionCorrectiva>> GetPorNoConformidadAsync(int noConformidadId)
    {
        return await _context.AccionesCorrectivas
            .Where(a => a.NoConformidadId == noConformidadId)
            .OrderByDescending(a => a.FechaCreacion)
            .ToListAsync();
    }

    public async Task<IEnumerable<AccionCorrectiva>> GetAbiertasAsync()
    {
        return await _context.AccionesCorrectivas
            .Where(a => a.Estado == EstadoAccionCorrectiva.Abierta)
            .Include(a => a.NoConformidad)
            .OrderByDescending(a => a.FechaCreacion)
            .ToListAsync();
    }

    public async Task<IEnumerable<AccionCorrectiva>> GetVencidasAsync()
    {
        var ahora = DateTime.UtcNow;
        return await _context.AccionesCorrectivas
            .Where(a => a.Estado == EstadoAccionCorrectiva.Abierta && a.FechaVencimiento < ahora)
            .Include(a => a.NoConformidad)
            .OrderBy(a => a.FechaVencimiento)
            .ToListAsync();
    }

    public async Task<IEnumerable<AccionCorrectiva>> GetPorEstadoAsync(EstadoAccionCorrectiva estado)
    {
        return await _context.AccionesCorrectivas
            .Where(a => a.Estado == estado)
            .Include(a => a.NoConformidad)
            .OrderByDescending(a => a.FechaCreacion)
            .ToListAsync();
    }

    public async Task<IEnumerable<AccionCorrectiva>> GetPorResponsableAsync(string usuarioId)
    {
        return await _context.AccionesCorrectivas
            .Where(a => a.Responsable == usuarioId && a.Estado == EstadoAccionCorrectiva.Abierta)
            .Include(a => a.NoConformidad)
            .OrderBy(a => a.FechaVencimiento)
            .ToListAsync();
    }

    public async Task AddAsync(AccionCorrectiva entity)
    {
        await _context.AccionesCorrectivas.AddAsync(entity);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(AccionCorrectiva entity)
    {
        _context.AccionesCorrectivas.Update(entity);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await GetByIdAsync(id);
        if (entity != null)
        {
            _context.AccionesCorrectivas.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}
