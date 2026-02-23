using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Domain.Interfaces.Repositories;

public interface INoConformidadRepository : IRepository<NoConformidad>
{
    Task<IEnumerable<NoConformidad>> GetByEstadoAsync(EstadoNoConformidad estado);
    Task<IEnumerable<NoConformidad>> GetWithAccionesVencidasAsync();
}