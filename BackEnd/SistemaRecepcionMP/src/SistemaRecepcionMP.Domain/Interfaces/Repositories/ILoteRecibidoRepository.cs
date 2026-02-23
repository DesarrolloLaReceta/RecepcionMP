using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Domain.Interfaces.Repositories;

public interface ILoteRecibidoRepository : IRepository<LoteRecibido>
{
    Task<LoteRecibido?> GetByCodigoInternoAsync(string codigo);
    Task<IEnumerable<LoteRecibido>> GetByEstadoAsync(EstadoLote estado);
    Task<IEnumerable<LoteRecibido>> GetVencimientosProximosAsync(int diasUmbral);
    Task<IEnumerable<LoteRecibido>> GetByItemAsync(Guid itemId);
}