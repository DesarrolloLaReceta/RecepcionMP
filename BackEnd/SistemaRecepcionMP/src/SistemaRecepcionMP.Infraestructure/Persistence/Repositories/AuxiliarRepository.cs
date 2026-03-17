using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace SistemaRecepcionMP.Infraestructure.Persistence.Repositories;

public sealed class CheckListBPMRepository : GenericRepository<ChecklistBPM>, ICheckListBPMRepository
{
    public CheckListBPMRepository(ApplicationDbContext context) : base(context) { }

    public async Task<ChecklistBPM?> GetActivoByCategoriaAsync(Guid categoriaId)
        => await DbSet
            .Include(c => c.Items.OrderBy(i => i.Orden))
            .FirstOrDefaultAsync(c => c.CategoriaId == categoriaId && c.Estado);

    public override async Task<ChecklistBPM?> GetByIdAsync(Guid id)
        => await DbSet
            .Include(c => c.Items.OrderBy(i => i.Orden))
            .FirstOrDefaultAsync(c => c.Id == id);

    public async Task<ChecklistBPM?> GetUltimaVersionAsync(Guid categoriaId)
        => await DbSet
            .Include(c => c.Items.OrderBy(i => i.Orden))
            .Where(c => c.CategoriaId == categoriaId)
            .OrderByDescending(c => c.Version)
            .FirstOrDefaultAsync();

    public async Task<IEnumerable<ChecklistBPM>> GetAllConItemsAsync()
        => await Context.Set<ChecklistBPM>()
            .AsNoTracking()
            .Include(c => c.Categoria)
            .Include(c => c.Items.OrderBy(i => i.Orden))
            .OrderBy(c => c.Categoria.Nombre)
            .ThenByDescending(c => c.Version)
            .ToListAsync();

    public async Task<ChecklistBPM?> GetByIdConItemsAsync(Guid id)
        => await Context.Set<ChecklistBPM>()
            .Include(c => c.Categoria)
            .Include(c => c.Items.OrderBy(i => i.Orden))
            .FirstOrDefaultAsync(c => c.Id == id);
}

public sealed class NoConformidadRepository
    : GenericRepository<NoConformidad>, INoConformidadRepository
{
    public NoConformidadRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IEnumerable<NoConformidad>> GetByEstadoAsync(EstadoNoConformidad estado)
        => await DbSet
            .Include(nc => nc.Causal)
            .Include(nc => nc.LoteRecibido).ThenInclude(l => l!.Item)
            .Include(nc => nc.AccionesCorrectivas)
            .Where(nc => nc.Estado == estado)
            .OrderByDescending(nc => nc.CreadoEn)
            .ToListAsync();

    public override async Task<NoConformidad?> GetByIdAsync(Guid id)
        => await DbSet
            .Include(nc => nc.Causal)
            .Include(nc => nc.LoteRecibido)
            .Include(nc => nc.AccionesCorrectivas).ThenInclude(a => a.ResponsableId)
            .FirstOrDefaultAsync(nc => nc.Id == id);

    public override async Task<IEnumerable<NoConformidad>> GetAllAsync()
        => await DbSet
            .Include(nc => nc.Causal)
            .Include(nc => nc.LoteRecibido).ThenInclude(l => l!.Item)
            .Include(nc => nc.AccionesCorrectivas)
            .OrderByDescending(nc => nc.CreadoEn)
            .ToListAsync();

    public async Task<IEnumerable<NoConformidad>> GetWithAccionesVencidasAsync()
        => await DbSet
            .Include(nc => nc.Causal)
            .Include(nc => nc.LoteRecibido).ThenInclude(l => l!.Item)
            .Include(nc => nc.AccionesCorrectivas).ThenInclude(a => a.ResponsableId)
            .Where(nc => nc.AccionesCorrectivas.Any(a => a.FechaCompromiso < DateOnly.FromDateTime(DateTime.UtcNow)))
            .OrderByDescending(nc => nc.CreadoEn)
            .ToListAsync();
}

public sealed class TemperaturaRegistroRepository
    : GenericRepository<TemperaturaRegistro>, ITemperaturaRegistroRepository
{
    public TemperaturaRegistroRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IEnumerable<TemperaturaRegistro>> GetByLoteAsync(Guid loteId)
        => await DbSet
            .Where(t => t.LoteRecibidoId == loteId)
            .OrderBy(t => t.FechaHora)
            .ToListAsync();

    public async Task<IEnumerable<TemperaturaRegistro>> GetFueraDeRangoAsync(
        Guid? recepcionId = null)
    {
        var query = DbSet
            .Include(t => t.LoteRecibido).ThenInclude(l => l!.Item)
            .Where(t => t.EstaFueraDeRango);

        if (recepcionId.HasValue)
            query = query.Where(t => t.RecepcionId == recepcionId.Value);

        return await query
            .OrderByDescending(t => t.FechaHora)
            .ToListAsync();
    }

    public async Task<IEnumerable<TemperaturaRegistro>> GetByRecepcionAsync(Guid recepcionId)
        => await DbSet
            .Where(t => t.RecepcionId == recepcionId)
            .OrderBy(t => t.FechaHora)
            .ToListAsync();
}

public sealed class UsuarioRepository : GenericRepository<Usuario>, IUsuarioRepository
{
    public UsuarioRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Usuario?> GetByEntraIdAsync(string entraId)
        => await DbSet.FirstOrDefaultAsync(u => u.EntraId == entraId);

    public async Task<Usuario?> GetByEmailAsync(string email)
        => await DbSet.FirstOrDefaultAsync(u => u.Email == email);

    public async Task<IEnumerable<Usuario>> GetByPerfilAsync(PerfilUsuario perfil)
        => await DbSet
            .Where(u => u.Perfil == perfil && u.Activo)
            .OrderBy(u => u.Nombre)
            .ToListAsync();
}

public sealed class BitacoraAuditoriaRepository : GenericRepository<BitacoraAuditoria>, IBitacoraAuditoriaRepository
{
    public BitacoraAuditoriaRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IEnumerable<BitacoraAuditoria>> GetByEntidadAsync(string entidad, string registroId)
        => await DbSet
            .Where(b => b.EntidadAfectada == entidad && b.RegistroId == registroId)
            .OrderByDescending(b => b.FechaHora)
            .ToListAsync();

    public async Task<IEnumerable<BitacoraAuditoria>> GetByUsuarioAsync(Guid usuarioId)
        => await DbSet
            .Where(b => b.UsuarioId == usuarioId)
            .OrderByDescending(b => b.FechaHora)
            .ToListAsync();
}