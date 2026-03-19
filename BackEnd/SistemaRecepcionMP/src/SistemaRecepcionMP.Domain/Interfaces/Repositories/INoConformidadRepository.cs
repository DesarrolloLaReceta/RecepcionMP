using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Domain.Interfaces.Repositories;

public interface INoConformidadRepository : IRepository<NoConformidad>
{
    Task<IEnumerable<NoConformidad>> GetByEstadoAsync(EstadoNoConformidad estado);
    Task<IEnumerable<NoConformidad>> GetWithAccionesVencidasAsync();
    Task<IEnumerable<NoConformidad>> GetAllConDetallesAsync();
    Task<NoConformidad?> GetByIdConDetallesAsync(Guid id);
    Task AgregarComentarioAsync(ComentarioNoConformidad comentario);
    Task<IEnumerable<CausalNoConformidad>> GetCausalesAsync();
}