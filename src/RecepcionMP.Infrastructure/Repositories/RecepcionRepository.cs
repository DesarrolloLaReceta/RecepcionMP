using Microsoft.EntityFrameworkCore;
using RecepcionMP.Application.Interfaces;
using RecepcionMP.Application.Interfaces.Repositories;
using RecepcionMP.Domain.Entities;
using RecepcionMP.Infrastructure.Persistence;

namespace RecepcionMP.Infrastructure.Repositories
{
    public class RecepcionRepository : IRecepcionRepository
    {
        private readonly ApplicationDbContext _context;

        public RecepcionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Recepcion recepcion)
        {
            await _context.Recepciones.AddAsync(recepcion);
            await _context.SaveChangesAsync();
        }

        public async Task<Recepcion?> ObtenerPorIdAsync(int id)
        {
            return await _context.Recepciones
                .Include(r => r.OrdenCompra)
                .Include(r => r.Factura)
                .Include(r => r.Lotes)
                    .ThenInclude(l => l.Item)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<IEnumerable<Recepcion>> ObtenerPorProveedorAsync(int proveedorId, DateTime desde, DateTime hasta)
        {
            return await _context.Recepciones
                .Include(r => r.OrdenCompra).ThenInclude(oc => oc.Proveedor)
                .Include(r => r.Factura)
                .Include(r => r.Lotes).ThenInclude(l => l.Item)
                .Where(r => r.OrdenCompra != null && r.OrdenCompra.ProveedorId == proveedorId && r.FechaRecepcion >= desde && r.FechaRecepcion <= hasta)
                .ToListAsync();
        }

        public async Task<IEnumerable<Recepcion>> ObtenerPorFacturaIdAsync(int facturaId)
        {
            return await _context.Recepciones
                .Include(r => r.OrdenCompra).ThenInclude(oc => oc.Proveedor)
                .Include(r => r.Factura)
                .Include(r => r.Lotes).ThenInclude(l => l.Item)
                .Where(r => r.FacturaId == facturaId)
                .ToListAsync();
        }

        public async Task<decimal> ObtenerCantidadRecibidaAsync(int ordenCompraId,int itemId)
        {
            return await _context.Lotes
                .Where(l =>
                    l.Recepcion.OrdenCompraId == ordenCompraId &&
                    l.ItemId == itemId)
                .SumAsync(l => l.CantidadRecibida);
        }

        public async Task<IEnumerable<Recepcion>> ObtenerTodosAsync()
        {
            return await _context.Recepciones
                .Include(r => r.OrdenCompra)
                .Include(r => r.Factura)
                .Include(r => r.Lotes)
                    .ThenInclude(l => l.Item)
                .ToListAsync();
        }

    }
}
