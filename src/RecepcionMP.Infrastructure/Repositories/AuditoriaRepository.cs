using Microsoft.EntityFrameworkCore;
using RecepcionMP.Application.Interfaces;
using RecepcionMP.Application.Interfaces.Repositories;
using RecepcionMP.Domain.Entities;
using RecepcionMP.Infrastructure.Persistence;

namespace RecepcionMP.Infrastructure.Repositories
{
    public class AuditoriaRepository : IAuditoriaRepository
    {
        private readonly ApplicationDbContext _context;

        public AuditoriaRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task LogAsync(RegistroAuditoria registro)
        {
            // Validar integridad antes de insertar
            if (string.IsNullOrEmpty(registro.UsuarioId) || string.IsNullOrEmpty(registro.Tabla))
                throw new ArgumentException("Usuario y Tabla son requeridos en auditoría");

            await _context.RegistrosAuditoria.AddAsync(registro);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<RegistroAuditoria>> GetHistorialPorTablaAsync(string tabla, int registroId)
        {
            return await _context.RegistrosAuditoria
                .Where(r => r.Tabla == tabla && r.RegistroId == registroId)
                .OrderByDescending(r => r.FechaHora)
                .ToListAsync();
        }

        public async Task<IEnumerable<RegistroAuditoria>> GetHistorialPorFechaAsync(DateTime desde, DateTime hasta)
        {
            return await _context.RegistrosAuditoria
                .Where(r => r.FechaHora >= desde && r.FechaHora <= hasta)
                .OrderByDescending(r => r.FechaHora)
                .ToListAsync();
        }

        public async Task<IEnumerable<RegistroAuditoria>> GetHistorialPorUsuarioAsync(string usuarioId)
        {
            return await _context.RegistrosAuditoria
                .Where(r => r.UsuarioId == usuarioId)
                .OrderByDescending(r => r.FechaHora)
                .ToListAsync();
        }

        public async Task<IEnumerable<RegistroAuditoria>> GetPorAccionAsync(TipoAccion accion, DateTime desde, DateTime hasta)
        {
            return await _context.RegistrosAuditoria
                .Where(r => r.Accion == accion && r.FechaHora >= desde && r.FechaHora <= hasta)
                .OrderByDescending(r => r.FechaHora)
                .ToListAsync();
        }

        public async Task<bool> VerificarIntegridadAsync(int registroId)
        {
            var registro = await _context.RegistrosAuditoria.FirstOrDefaultAsync(r => r.Id == registroId);
            if (registro == null)
                return false;

            // En futuro: implementar firma digital o hash inmutable
            return true;
        }
    }
}