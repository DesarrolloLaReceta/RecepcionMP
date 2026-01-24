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
    public class DocumentoValidacionRepository : IDocumentoValidacionRepository
    {
        private readonly ApplicationDbContext _context;

        public DocumentoValidacionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(DocumentoValidacion validacion)
        {
            await _context.DocumentosValidacion.AddAsync(validacion);
            await _context.SaveChangesAsync();
        }

        public async Task<DocumentoValidacion> GetByIdAsync(int id)
        {
            return await _context.DocumentosValidacion
                .Include(d => d.RecepcionDocumento)
                .Include(d => d.DocumentoRequerido)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<IEnumerable<DocumentoValidacion>> GetPorRecepcionAsync(int recepcionId)
        {
            return await _context.DocumentosValidacion
                .Where(d => d.RecepcionDocumento.RecepcionId == recepcionId)
                .OrderByDescending(d => d.FechaValidacion)
                .ToListAsync();
        }

        public async Task<IEnumerable<DocumentoValidacion>> GetPorRecepcionDocumentoAsync(int recepcionDocumentoId)
        {
            return await _context.DocumentosValidacion
                .Where(d => d.RecepcionDocumentoId == recepcionDocumentoId)
                .OrderByDescending(d => d.FechaValidacion)
                .ToListAsync();
        }

        public async Task<IEnumerable<DocumentoValidacion>> GetRechazadosAsync(DateTime desde, DateTime hasta)
        {
            return await _context.DocumentosValidacion
                .Where(d => !d.EsValido && d.FechaValidacion >= desde && d.FechaValidacion <= hasta)
                .OrderByDescending(d => d.FechaValidacion)
                .ToListAsync();
        }

        public async Task<IEnumerable<DocumentoValidacion>> GetVencidosAsync()
        {
            var hoy = DateTime.UtcNow.Date;
            return await _context.DocumentosValidacion
                .Where(d => d.FechaVencimientoDocumento.HasValue && d.FechaVencimientoDocumento.Value.Date < hoy && d.EstaVigente)
                .OrderBy(d => d.FechaVencimientoDocumento)
                .ToListAsync();
        }

        public async Task UpdateAsync(DocumentoValidacion validacion)
        {
            _context.DocumentosValidacion.Update(validacion);
            await _context.SaveChangesAsync();
        }
    }
}
