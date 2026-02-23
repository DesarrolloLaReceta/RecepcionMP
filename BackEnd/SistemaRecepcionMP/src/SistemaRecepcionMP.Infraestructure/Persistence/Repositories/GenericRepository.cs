using Microsoft.EntityFrameworkCore;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;

namespace SistemaRecepcionMP.Infraestructure.Persistence.Repositories;

/// <summary>
/// Implementación base para todos los repositorios.
/// Proporciona las operaciones CRUD estándar.
/// Los repositorios específicos heredan de esta clase y agregan métodos propios.
/// </summary>
public abstract class GenericRepository<T> : IRepository<T> where T : class
{
    protected readonly ApplicationDbContext Context;
    protected readonly DbSet<T> DbSet;

    protected GenericRepository(ApplicationDbContext context)
    {
        Context = context;
        DbSet = context.Set<T>();
    }

    public virtual async Task<T?> GetByIdAsync(Guid id)
        => await DbSet.FindAsync(id);

    public virtual async Task<IEnumerable<T>> GetAllAsync()
        => await DbSet.ToListAsync();

    public virtual async Task AddAsync(T entity)
        => await DbSet.AddAsync(entity);

    public virtual void Update(T entity)
        => DbSet.Update(entity);

    public virtual void Delete(T entity)
        => DbSet.Remove(entity);
}