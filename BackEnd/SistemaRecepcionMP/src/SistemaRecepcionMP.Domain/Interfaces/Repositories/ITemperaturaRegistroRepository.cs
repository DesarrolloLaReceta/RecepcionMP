using SistemaRecepcionMP.Domain.Entities;

namespace SistemaRecepcionMP.Domain.Interfaces.Repositories;

public interface ITemperaturaRegistroRepository : IRepository<TemperaturaRegistro>
{
    Task<IEnumerable<TemperaturaRegistro>> GetByRecepcionAsync(Guid recepcionId);
    Task<IEnumerable<TemperaturaRegistro>> GetByLoteAsync(Guid loteRecibidoId);
    Task<IEnumerable<TemperaturaRegistro>> GetFueraDeRangoAsync(Guid? recepcionId = null);
}