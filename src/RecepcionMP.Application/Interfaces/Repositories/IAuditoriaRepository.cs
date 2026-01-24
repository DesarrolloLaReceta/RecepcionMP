using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Application.Interfaces.Repositories
{
    public interface IAuditoriaRepository
    {
        Task LogAsync(RegistroAuditoria registro);
        Task<IEnumerable<RegistroAuditoria>> GetHistorialPorTablaAsync(string tabla, int registroId);
        Task<IEnumerable<RegistroAuditoria>> GetHistorialPorFechaAsync(DateTime desde, DateTime hasta);
        Task<IEnumerable<RegistroAuditoria>> GetHistorialPorUsuarioAsync(string usuarioId);
        Task<IEnumerable<RegistroAuditoria>> GetPorAccionAsync(TipoAccion accion, DateTime desde, DateTime hasta);
        Task<bool> VerificarIntegridadAsync(int registroId); // Verificar que no fue alterado
    }
}