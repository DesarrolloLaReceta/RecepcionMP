using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using SistemaRecepcionMP.Application.Common.Mappings;

namespace SistemaRecepcionMP.Infraestructure.Persistence.Repositories;

public sealed class CheckListBPMRepository : GenericRepository<ChecklistBPM>, ICheckListBPMRepository
{
    public CheckListBPMRepository(ApplicationDbContext context) : base(context) { }

    public async Task<ChecklistBPM?> GetActivoByCategoriaAsync(Guid categoriaId)
        => await DbSet.Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.CategoriaId == categoriaId && c.Estado);

    public async Task<ChecklistBPM?> GetUltimaVersionAsync(Guid categoriaId)
        => await DbSet
            .Where(c => c.CategoriaId == categoriaId)
            .OrderByDescending(c => c.Version)
            .FirstOrDefaultAsync();

    public async Task<IEnumerable<ChecklistBPM>> GetAllConItemsAsync()
        => await DbSet
            .AsNoTracking()
            .Include(c => c.Categoria)
            .Include(c => c.Items.OrderBy(i => i.Orden))
            .OrderBy(c => c.Categoria.Nombre)
            .ThenByDescending(c => c.Version)
            .ToListAsync();

    public async Task<ChecklistBPM?> GetByIdConItemsAsync(Guid id)
        => await DbSet
            .Include(c => c.Categoria)
            .Include(c => c.Items.OrderBy(i => i.Orden))
            .FirstOrDefaultAsync(c => c.Id == id);

    public async Task<bool> ExisteAsync(Guid id)
        => await DbSet
            .AsNoTracking()
            .AnyAsync(c => c.Id == id);

    public async Task RemoverItemsAsync(Guid checklistId)
        => await Context.Database.ExecuteSqlRawAsync(
            "DELETE FROM ItemsChecklist WHERE ChecklistId = {0}", checklistId);

    public async Task AgregarItemsAsync(List<ItemChecklist> items)
        => await Context.Set<ItemChecklist>().AddRangeAsync(items);
    
    public async Task<bool> TieneResultadosAsync(Guid checklistId)
        => await Context.Set<ResultadoChecklist>()
            .AsNoTracking()
            .AnyAsync(r => r.ChecklistId == checklistId);

    public async Task EliminarAsync(Guid id)
        => await Context.Database.ExecuteSqlRawAsync(
            "DELETE FROM ChecklistsBPM WHERE Id = {0}", id);
    
    public async Task<bool> ExisteItemsAsync(Guid checklistId)
        => await Context.Set<ItemChecklist>()
            .AsNoTracking()
            .AnyAsync(i => i.ChecklistId == checklistId);

}

public sealed class NoConformidadRepository
    : GenericRepository<NoConformidad>, INoConformidadRepository
{
    public NoConformidadRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IEnumerable<NoConformidad>> GetByEstadoAsync(EstadoNoConformidad estado)
        => await DbSet
            .Include(nc => nc.Causal)
            .Include(nc => nc.LoteRecibido)
            .ThenInclude(l => l.RecepcionItem)
                .ThenInclude(ri => ri!.Item)
            .Include(nc => nc.AccionesCorrectivas)
            .Where(nc => nc.Estado == estado)
            .OrderByDescending(nc => nc.CreadoEn)
            .ToListAsync();

    public override async Task<NoConformidad?> GetByIdAsync(Guid id)
        => await DbSet
            .Include(nc => nc.Causal)
            .Include(nc => nc.LoteRecibido)
                .ThenInclude(l => l.RecepcionItem)
                    .ThenInclude(ri => ri!.Item)
            .Include(nc => nc.AccionesCorrectivas).ThenInclude(a => a.ResponsableId)
            .FirstOrDefaultAsync(nc => nc.Id == id);

    public override async Task<IEnumerable<NoConformidad>> GetAllAsync()
        => await DbSet
            .Include(nc => nc.Causal)
            .Include(nc => nc.LoteRecibido)
                .ThenInclude(l => l.RecepcionItem)
                    .ThenInclude(ri => ri!.Item)
            .Include(nc => nc.AccionesCorrectivas)
            .OrderByDescending(nc => nc.CreadoEn)
            .ToListAsync();

    public async Task<IEnumerable<NoConformidad>> GetWithAccionesVencidasAsync()
        => await DbSet
            .Include(nc => nc.Causal)
            .Include(nc => nc.LoteRecibido)
                .ThenInclude(l => l.RecepcionItem)
                    .ThenInclude(ri => ri!.Item)
            .Include(nc => nc.AccionesCorrectivas).ThenInclude(a => a.ResponsableId)
            .Where(nc => nc.AccionesCorrectivas.Any(a => a.FechaCompromiso < DateOnly.FromDateTime(DateTime.UtcNow)))
            .OrderByDescending(nc => nc.CreadoEn)
            .ToListAsync();

        public async Task<IEnumerable<NoConformidad>> GetAllConDetallesAsync()
            => await Context.Set<NoConformidad>()
                .AsNoTracking()
                .Include(n => n.Causal)
                .Include(n => n.UsuarioCreador)
                .Include(n => n.LoteRecibido)
                    .ThenInclude(l => l.RecepcionItem)
                        .ThenInclude(ri => ri!.Item)
                .Include(n => n.LoteRecibido).ThenInclude(l => l.Recepcion).ThenInclude(r => r.Proveedor)
                .Include(n => n.AccionesCorrectivas)
                .OrderByDescending(n => n.CreadoEn)
                .ToListAsync();

        public async Task<NoConformidad?> GetByIdConDetallesAsync(Guid id)
            => await Context.Set<NoConformidad>()
                .Include(n => n.Causal)
                .Include(n => n.UsuarioCreador)
                .Include(n => n.LoteRecibido)
                    .ThenInclude(l => l.RecepcionItem)
                        .ThenInclude(ri => ri!.Item)
                .Include(n => n.LoteRecibido).ThenInclude(l => l.Recepcion).ThenInclude(r => r.Proveedor)
                .Include(n => n.AccionesCorrectivas)
                .Include(n => n.Comentarios).ThenInclude(c => c.Autor)
                .FirstOrDefaultAsync(n => n.Id == id);

        public async Task AgregarComentarioAsync(ComentarioNoConformidad comentario)
        => await Context.Set<ComentarioNoConformidad>().AddAsync(comentario);

        public async Task<IEnumerable<CausalNoConformidad>> GetCausalesAsync()
            => await Context.Set<CausalNoConformidad>()
                .Where(c => c.Activo)
                .OrderBy(c => c.Nombre)
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
            .Include(t => t.LoteRecibido)
                .ThenInclude(l => l!.RecepcionItem)
                    .ThenInclude(ri => ri!.Item)
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

    public async Task<Usuario?> GetByUsernameAsync(string username)
    {
        return await DbSet.FirstOrDefaultAsync(u => u.Username == username && u.Activo);
    }

    public async Task<Usuario?> GetByEmailAsync(string email)
        => await DbSet.FirstOrDefaultAsync(u => u.Email == email);

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