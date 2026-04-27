using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;

namespace SistemaRecepcionMP.Infraestructure.Persistence.Repositories;

public sealed class LavadoBotasManosRepository
    : GenericRepository<LavadoBotasManos>, ILavadoBotasManosRepository
{
    public LavadoBotasManosRepository(ApplicationDbContext context) : base(context)
    {
    }
}

