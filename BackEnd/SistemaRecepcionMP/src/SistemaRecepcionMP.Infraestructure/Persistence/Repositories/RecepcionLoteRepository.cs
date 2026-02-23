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
            .Include(r => r.Lotes)
                .ThenInclude(l => l.Item).ThenInclude(i => i!.Categoria)
            .Include(r => r.Lotes)
                .ThenInclude(l => l.Liberacion)
            .Include(r => r.Lotes)
                .ThenInclude(l => l.Cuarentena)
            .Include(r => r.Lotes)
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
        .Include(r => r.UsuarioCreador)
        .Include(r => r.InspeccionVehiculo)
        .Include(r => r.Factura)
        .Include(r => r.Lotes)
            .ThenInclude(l => l.Item)
                .ThenInclude(i => i!.Categoria)
        .Include(r => r.Lotes)
            .ThenInclude(l => l.Liberacion)
        .Include(r => r.Lotes)
            .ThenInclude(l => l.Cuarentena)
        .Include(r => r.Lotes)
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
}

public sealed class LoteRecibidoRepository : GenericRepository<LoteRecibido>, ILoteRecibidoRepository
{
    public LoteRecibidoRepository(ApplicationDbContext context) : base(context) { }

    public override async Task<LoteRecibido?> GetByIdAsync(Guid id)
        => await DbSet
            .Include(l => l.Item).ThenInclude(i => i!.Categoria)
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
            .Include(l => l.Item)
            .Include(l => l.Recepcion).ThenInclude(r => r!.Proveedor)
            .Where(l =>
                l.VidaUtil.FechaVencimiento <= fechaLimite &&
                l.Estado != EstadoLote.RechazadoTotal)
            .OrderBy(l => l.VidaUtil.FechaVencimiento)
            .ToListAsync();
    }

    public async Task<LoteRecibido?> GetByCodigoInternoAsync(string codigoLoteInterno)
        => await DbSet
            .Include(l => l.Item).ThenInclude(i => i!.Categoria)
            .Include(l => l.Liberacion).ThenInclude(lib => lib!.UsuarioCalidad)
            .Include(l => l.Cuarentena)
            .Include(l => l.NoConformidades).ThenInclude(nc => nc.Causal)
            .Include(l => l.ResultadosChecklist).ThenInclude(r => r.ItemChecklist)
            .Include(l => l.Documentos)
            .Include(l => l.RegistrosTemperatura)
            .FirstOrDefaultAsync(l => l.CodigoLoteInterno == codigoLoteInterno);

    public async Task<IEnumerable<LoteRecibido>> GetByEstadoAsync(EstadoLote estado)
        => await DbSet
            .Include(l => l.Item).ThenInclude(i => i!.Categoria)
            .Include(l => l.Recepcion).ThenInclude(r => r!.Proveedor)
            .Where(l => l.Estado == estado)
            .OrderByDescending(l => l.FechaRegistro)
            .ToListAsync();
    
    public async Task<IEnumerable<LoteRecibido>> GetByItemAsync(Guid itemId)
        => await DbSet
            .Include(l => l.Item).ThenInclude(i => i!.Categoria)
            .Include(l => l.Recepcion).ThenInclude(r => r!.Proveedor)
            .Where(l => l.ItemId == itemId)
            .ToListAsync();
}