using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;

namespace SistemaRecepcionMP.Infraestructure.Persistence.Repositories;

public sealed class VerificacionInstalacionRepository
    : GenericRepository<VerificacionInstalacion>, IVerificacionInstalacionRepository
{
    public VerificacionInstalacionRepository(ApplicationDbContext context) : base(context)
    {
    }
}

