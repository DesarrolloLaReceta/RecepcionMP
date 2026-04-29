using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;

namespace SistemaRecepcionMP.Infraestructure.Persistence.Repositories;

public class LiberacionCocinaRepository : GenericRepository<LiberacionCocina>, IRepository<LiberacionCocina>
{
    public LiberacionCocinaRepository(ApplicationDbContext context) : base(context)
    {
    }
}