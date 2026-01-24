using Microsoft.EntityFrameworkCore;
using RecepcionMP.Application.Interfaces;
using RecepcionMP.Application.Interfaces.Repositories;
using RecepcionMP.Domain.Entities;
using RecepcionMP.Infrastructure.Persistence;

public class OrdenCompraRepository : IOrdenCompraRepository
{
    private readonly ApplicationDbContext _context;

    public OrdenCompraRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(OrdenCompra ordenCompra)
    {
        _context.OrdenesCompra.Add(ordenCompra);
        await _context.SaveChangesAsync();
    }

    public async Task<List<OrdenCompra>> GetAllAsync()
    {
        return await _context.OrdenesCompra
            .Include(o => o.Proveedor)
            .Include(o => o.Items)
                .ThenInclude(i => i.Item)
            .ToListAsync();
    }

    public async Task<OrdenCompra?> GetByIdAsync(int id)
    {
        return await _context.OrdenesCompra
            .Include(o => o.Proveedor)
            .Include(o => o.Items)
                .ThenInclude(i => i.Item)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<OrdenCompra?> GetByNumeroAsync(string numeroOrden)
    {
        return await _context.OrdenesCompra
            .FirstOrDefaultAsync(o => o.NumeroOrden == numeroOrden);
    }

    public async Task UpdateAsync(OrdenCompra ordenCompra)
    {
        _context.OrdenesCompra.Update(ordenCompra);
        await _context.SaveChangesAsync();
    }
}
