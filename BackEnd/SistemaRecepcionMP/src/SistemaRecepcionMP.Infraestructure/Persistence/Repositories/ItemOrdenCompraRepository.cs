using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Infraestructure.Persistence.Repositories;

public sealed class ItemRepository : GenericRepository<Item>, IItemRepository
{
    public ItemRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Item?> GetByCodigoInternoAsync(string codigoInterno)
        => await DbSet
            .Include(i => i.Categoria)
            .FirstOrDefaultAsync(i => i.CodigoInterno == codigoInterno);

    public async Task<IEnumerable<Item>> GetByCategoriaAsync(Guid categoriaId)
        => await DbSet
            .Include(i => i.Categoria)
            .Where(i => i.CategoriaId == categoriaId)
            .OrderBy(i => i.Nombre)
            .ToListAsync();

    public async Task<IEnumerable<Item>> GetActivosAsync()
        => await DbSet
            .Include(i => i.Categoria)
            .Where(i => i.Estado)
            .OrderBy(i => i.Nombre)
            .ToListAsync();

    public override async Task<Item?> GetByIdAsync(Guid id)
        => await DbSet
            .Include(i => i.Categoria)
                .ThenInclude(c => c.DocumentosExigidos)
            .FirstOrDefaultAsync(i => i.Id == id);
    
    public async Task<IEnumerable<Item>> GetAllConCategoriaAsync()
        => await DbSet
            .AsNoTracking()
            .Include(i => i.Categoria)
                .ThenInclude(c => c.DocumentosExigidos)
            .OrderBy(i => i.Nombre)
            .ToListAsync();

    public async Task<IEnumerable<CategoriaItem>> GetCategoriasAsync()
    {
        return await Context.Set<CategoriaItem>()
            .AsNoTracking()
            .OrderBy(c => c.Nombre)
            .ToListAsync();
    }
}

public sealed class OrdenCompraRepository : GenericRepository<OrdenCompra>, IOrdenCompraRepository
{
    public OrdenCompraRepository(ApplicationDbContext context) : base(context) { }

    public async Task<OrdenCompra?> GetByNumeroOCAsync(string numeroOC)
        => await DbSet
            .Include(o => o.Proveedor)
            .Include(o => o.Detalles).ThenInclude(d => d.Item)
            .FirstOrDefaultAsync(o => o.NumeroOC == numeroOC);

    public async Task<IEnumerable<OrdenCompra>> GetAbiertasAsync()
        => await DbSet
            .Include(o => o.Proveedor)
            .Include(o => o.Detalles)
            .Where(o => o.Estado == Domain.Enums.EstadoOrdenCompra.Abierta ||
                        o.Estado == Domain.Enums.EstadoOrdenCompra.ParcialmenteRecibida)
            .OrderByDescending(o => o.FechaEmision)
            .ToListAsync();

    public async Task<IEnumerable<OrdenCompra>> GetByProveedorAsync(Guid proveedorId)
        => await DbSet
            .Include(o => o.Detalles).ThenInclude(d => d.Item)
            .Where(o => o.ProveedorId == proveedorId)
            .OrderByDescending(o => o.FechaEmision)
            .ToListAsync();

    public override async Task<OrdenCompra?> GetByIdAsync(Guid id)
        => await DbSet
            .Include(o => o.Proveedor)
            .Include(o => o.UsuarioCreador)
            .Include(o => o.Recepciones)
            .Include(o => o.Detalles)
                .ThenInclude(d => d.Item)
                .ThenInclude(i => i.Categoria)
            .FirstOrDefaultAsync(o => o.Id == id);
    
    public async Task<IEnumerable<OrdenCompra>> GetAllConDetallesAsync(
        EstadoOrdenCompra? estado = null,
        Guid? proveedorId = null)
    {
        var query = DbSet
            .AsNoTracking()
            .Include(o => o.Proveedor)
            .Include(o => o.Detalles)
                .ThenInclude(d => d.Item)
                    .ThenInclude(i => i.Categoria)
            .AsQueryable();

        if (estado.HasValue)
            query = query.Where(o => o.Estado == estado.Value);

        if (proveedorId.HasValue)
            query = query.Where(o => o.ProveedorId == proveedorId.Value);

        return await query
            .OrderByDescending(o => o.FechaEmision)
            .ToListAsync();
    }
}