using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Infraestructure.Persistence.Repositories;

public sealed class ProveedorRepository : GenericRepository<Proveedor>, IProveedorRepository
{
    public ProveedorRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Proveedor?> GetByNitAsync(string nit)
        => await DbSet
            .FirstOrDefaultAsync(p => p.Nit == nit);

    public async Task<IEnumerable<Proveedor>> GetActivosAsync()
        => await DbSet
            .Where(p => p.Estado == EstadoProveedor.Activo)
            .OrderBy(p => p.RazonSocial)
            .ToListAsync();

    public async Task<IEnumerable<DocumentoSanitarioProveedor>> GetDocumentosProximosAVencerAsync(
        int diasUmbral)
    {
        var fechaLimite = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(diasUmbral));

        return await Context.DocumentosSanitariosProveedor
            .Include(d => d.Proveedor)
            .Where(d => d.FechaVencimiento <= fechaLimite)
            .OrderBy(d => d.FechaVencimiento)
            .ToListAsync();
    }

    public async Task<Proveedor?> GetWithDocumentosSanitariosAsync(Guid proveedorId)
        => await DbSet
            .Include(p => p.DocumentosSanitarios)
            .Include(p => p.Contactos)
            .Include(p => p.OrdenesCompra)
                .ThenInclude(oc => oc.Recepciones)
                    .ThenInclude(r => r.Items)
                        .ThenInclude(i => i.Lotes)
            .Include(p => p.OrdenesCompra)
                .ThenInclude(oc => oc.Detalles)
                    .ThenInclude(d => d.Item)
                        .ThenInclude(i => i.Categoria)
            .FirstOrDefaultAsync(p => p.Id == proveedorId);

    public override async Task<IEnumerable<Proveedor>> GetAllAsync()
        => await DbSet
            .Include(p => p.DocumentosSanitarios)
            .Include(p => p.Contactos)
            .OrderBy(p => p.RazonSocial)
            .ToListAsync();

    public async Task AddDocumentoSanitarioAsync(DocumentoSanitarioProveedor documento)
    {
        await Context.Set<DocumentoSanitarioProveedor>().AddAsync(documento);
    }
}