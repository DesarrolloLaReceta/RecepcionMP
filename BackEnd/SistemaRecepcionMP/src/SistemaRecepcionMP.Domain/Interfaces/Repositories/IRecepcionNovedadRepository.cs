using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Domain.Interfaces.Repositories;

public interface IRecepcionNovedadRepository : IRepository<RecepcionNovedad>
{
    Task<bool> ExistePendientePorTipoAsync(Guid recepcionId, TipoNovedadRecepcion tipoNovedad, CancellationToken ct = default);
    Task<RecepcionNovedad?> ObtenerPendienteExcedenteAsync(Guid recepcionId, CancellationToken ct = default);
}
