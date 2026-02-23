using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace SistemaRecepcionMP.Infraestructure.Persistence.Repositories;

public sealed class ProveedorRepository : GenericRepository<Proveedor>, IProveedorRepository
{
    public ProveedorRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Proveedor?> GetByNitAsync(string nit)
        => await DbSet
            .FirstOrDefaultAsync(p => p.Nit == nit);

    public async Task<Proveedor?> GetWithDocumentosSanitariosAsync(Guid proveedorId)
        => await DbSet
            .Include(p => p.DocumentosSanitarios)
            .Include(p => p.Contactos)
            .FirstOrDefaultAsync(p => p.Id == proveedorId);

    public async Task<IEnumerable<Proveedor>> GetActivosAsync()
        => await DbSet
            .Where(p => p.Estado)
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
}