using Microsoft.EntityFrameworkCore;
using RecepcionMP.Application.Interfaces;
using RecepcionMP.Domain.Entities;
using RecepcionMP.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RecepcionMP.Infrastructure.Repositories
{
    public class DocumentoAdjuntoRepository : IDocumentoAdjuntoRepository
    {
        private readonly ApplicationDbContext _context;

        public DocumentoAdjuntoRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(DocumentoAdjunto adjunto)
        {
            await _context.DocumentosAdjuntos.AddAsync(adjunto);
            await _context.SaveChangesAsync();
        }

        public async Task EliminarAsync(int id)
        {
            var adjunto = await _context.DocumentosAdjuntos.FindAsync(id);
            if (adjunto == null) return;
            _context.DocumentosAdjuntos.Remove(adjunto);
            await _context.SaveChangesAsync();
        }

        public async Task<DocumentoAdjunto> GetByIdAsync(int id)
        {
            return await _context.DocumentosAdjuntos
                .Include(d => d.RecepcionDocumento)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<DocumentoAdjunto> GetPorHashAsync(string hash)
        {
            return await _context.DocumentosAdjuntos
                .FirstOrDefaultAsync(d => d.HashSHA256 == hash);
        }

        public async Task<IEnumerable<DocumentoAdjunto>> GetPendientesEliminacionAsync()
        {
            return await _context.DocumentosAdjuntos
                .Where(d => d.PendienteEliminacion)
                .OrderBy(d => d.FechaEliminacion)
                .ToListAsync();
        }

        public async Task<IEnumerable<DocumentoAdjunto>> GetPorRecepcionDocumentoAsync(int recepcionDocumentoId)
        {
            return await _context.DocumentosAdjuntos
                .Where(d => d.RecepcionDocumentoId == recepcionDocumentoId)
                .OrderByDescending(d => d.FechaCarga)
                .ToListAsync();
        }

        public async Task UpdateAsync(DocumentoAdjunto adjunto)
        {
            _context.DocumentosAdjuntos.Update(adjunto);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ValidarIntegridadAsync(int id)
        {
            var adjunto = await _context.DocumentosAdjuntos.FindAsync(id);
            if (adjunto == null) return false;

            // La validación real requeriría descargar y recalcular hash
            // Por ahora, retornamos si fue verificado previamente
            return adjunto.IntegridadVerificada;
        }
    }
}
