using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace SistemaRecepcionMP.Infraestructure.Persistence.Repositories;

public sealed class RecepcionRepository : GenericRepository<Recepcion>, IRecepcionRepository
{
    public RecepcionRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Recepcion?> GetWithLotesAsync(Guid recepcionId)
        => await DbSet
            .Include(r => r.OrdenCompra)
            .Include(r => r.Proveedor)
            .Include(r => r.InspeccionVehiculo)
            .Include(r => r.Factura)
            .Include(r => r.Items)
                .ThenInclude(i => i.Item)
                    .ThenInclude(p => p!.Categoria)

            .Include(r => r.Items)
                .ThenInclude(i => i.Lotes)
                    .ThenInclude(l => l.Liberacion)

            .Include(r => r.Items)
                .ThenInclude(i => i.Lotes)
                    .ThenInclude(l => l.Cuarentena)

            .Include(r => r.Items)
                .ThenInclude(i => i.Lotes)
                    .ThenInclude(l => l.NoConformidades)
            .Include(r => r.Documentos)
            .Include(r => r.RegistrosTemperatura)
            .FirstOrDefaultAsync(r => r.Id == recepcionId);

    public async Task<IEnumerable<Recepcion>> GetByEstadoAsync(EstadoRecepcion estado)
        => await DbSet
            .Include(r => r.Proveedor)
            .Include(r => r.OrdenCompra)
            .Where(r => r.Estado == estado)
            .OrderByDescending(r => r.FechaRecepcion)
            .ToListAsync();

    public override async Task<IEnumerable<Recepcion>> GetAllAsync()
        => await DbSet
            .Include(r => r.Proveedor)
            .Include(r => r.OrdenCompra)
            .OrderByDescending(r => r.FechaRecepcion)
            .ToListAsync();

    public async Task<Recepcion?> GetByNumeroRecepcionAsync(string numero)
    => await DbSet
        .Include(r => r.OrdenCompra)
        .Include(r => r.Proveedor)
        .Include(r => r.CreadoPor)
        .Include(r => r.InspeccionVehiculo)
        .Include(r => r.Factura)
        .Include(r => r.Items)
            .ThenInclude(i => i.Item)
                .ThenInclude(p => p!.Categoria)
        .Include(r => r.Items)
            .ThenInclude(i => i.Lotes)
                .ThenInclude(l => l.Liberacion)
        .Include(r => r.Items)
            .ThenInclude(i => i.Lotes)
                .ThenInclude(l => l.Cuarentena)
        .Include(r => r.Items)
            .ThenInclude(i => i.Lotes)
                .ThenInclude(l => l.NoConformidades)
        .Include(r => r.Documentos)
        .Include(r => r.RegistrosTemperatura)
        .FirstOrDefaultAsync(r => r.NumeroRecepcion == numero);

    public async Task<IEnumerable<Recepcion>> GetByProveedorAsync(Guid proveedorId)
        => await DbSet
            .Include(r => r.OrdenCompra)
            .Include(r => r.Proveedor)
            .Where(r => r.ProveedorId == proveedorId)
            .OrderByDescending(r => r.FechaRecepcion)
            .ToListAsync();
        
        public async Task AddInspeccionVehiculoAsync(InspeccionVehiculo inspeccion)
            => await Context.Set<InspeccionVehiculo>().AddAsync(inspeccion);

        public async Task<Recepcion?> GetWithItemsAndLotesAsync(Guid id)
        {
            return await DbSet
                .Include(r => r.Proveedor)
                .Include(r => r.Items)
                    .ThenInclude(i => i.DetalleOrdenCompra)
                .Include(r => r.Items)
                    .ThenInclude(i => i.Lotes)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<bool> ExisteRecepcionActivaPorOrdenCompra(Guid ordenCompraId)
        {
            return await Context.Recepciones
                .AnyAsync(r =>
                    r.OrdenCompraId == ordenCompraId &&
                    r.Estado != EstadoRecepcion.Finalizada &&
                    r.Estado != EstadoRecepcion.Rechazada
                );
        }
}

public sealed class LoteRecibidoRepository : GenericRepository<LoteRecibido>, ILoteRecibidoRepository
{
    public LoteRecibidoRepository(ApplicationDbContext context) : base(context) { }

    public override async Task<LoteRecibido?> GetByIdAsync(Guid id)
        => await DbSet
            .Include(l => l.RecepcionItem)
                .ThenInclude(i => i!.Item)
                    .ThenInclude(p => p!.Categoria)
            .Include(l => l.Liberacion).ThenInclude(lib => lib!.UsuarioCalidad)
            .Include(l => l.Cuarentena)
            .Include(l => l.NoConformidades).ThenInclude(nc => nc.Causal)
            .Include(l => l.ResultadosChecklist).ThenInclude(r => r.ItemChecklist)
            .Include(l => l.Documentos)
            .Include(l => l.RegistrosTemperatura)
            .FirstOrDefaultAsync(l => l.Id == id);

    public async Task<IEnumerable<LoteRecibido>> GetVencimientosProximosAsync(int diasUmbral)
    {
        var fechaLimite = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(diasUmbral));

        return await DbSet
            .Include(l => l.RecepcionItem)
            .Include(l => l.Recepcion).ThenInclude(r => r!.Proveedor)
            .Where(l =>
                l.VidaUtil!.FechaVencimiento <= fechaLimite &&
                l.Estado != EstadoLote.RechazadoTotal)
            .OrderBy(l => l.VidaUtil!.FechaVencimiento)
            .ToListAsync();
    }

    public async Task<LoteRecibido?> GetByCodigoInternoAsync(string codigoLoteInterno)
        => await DbSet
            .Include(l => l.RecepcionItem)
                .ThenInclude(i => i!.Item)
                    .ThenInclude(p => p!.Categoria)
            .Include(l => l.Liberacion).ThenInclude(lib => lib!.UsuarioCalidad)
            .Include(l => l.Cuarentena)
            .Include(l => l.NoConformidades).ThenInclude(nc => nc.Causal)
            .Include(l => l.ResultadosChecklist).ThenInclude(r => r.ItemChecklist)
            .Include(l => l.Documentos)
            .Include(l => l.RegistrosTemperatura)
            .FirstOrDefaultAsync(l => l.CodigoLoteInterno == codigoLoteInterno);

    public async Task<IEnumerable<LoteRecibido>> GetByEstadoAsync(EstadoLote estado)
    {
        return await Context.LotesRecibidos
            .Include(l => l.Recepcion)
                .ThenInclude(r => r.Proveedor)
            .Include(l => l.RecepcionItem)
                .ThenInclude(ri => ri!.Item)
                    .ThenInclude(i => i!.Categoria)
            .Include(l => l.RecepcionItem)
                .ThenInclude(ri => ri!.Item)
                    .ThenInclude(i => i!.RangoTemperatura)
            .Include(l => l.VidaUtil) // si es Value Object, no necesita Include
            .Where(l => l.Estado == estado)
            .OrderBy(l => l.VidaUtil!.FechaVencimiento)
            .ToListAsync();
    }
    
    public async Task<IEnumerable<LoteRecibido>> GetByItemAsync(Guid itemId)
    {
        return await DbSet
            .Include(l => l.Recepcion)
                .ThenInclude(r => r.Proveedor)
            .Include(l => l.RecepcionItem)
                .ThenInclude(ri => ri!.Item)
            .Where(l => l.RecepcionItem!.ItemId == itemId)
            .OrderBy(l => l.CodigoLoteInterno)
            .ToListAsync();
    }
}