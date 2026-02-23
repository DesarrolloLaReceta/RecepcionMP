using SistemaRecepcionMP.Domain.Entities;

namespace SistemaRecepcionMP.Domain.Interfaces.Repositories;

public interface IBitacoraAuditoriaRepository : IRepository<BitacoraAuditoria>
{
    Task<IEnumerable<BitacoraAuditoria>> GetByEntidadAsync(string entidad, string registroId);
    Task<IEnumerable<BitacoraAuditoria>> GetByUsuarioAsync(Guid usuarioId);
}