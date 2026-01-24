using Microsoft.EntityFrameworkCore;
using RecepcionMP.Application.Interfaces;
using RecepcionMP.Domain.Entities;
using RecepcionMP.Infrastructure.Persistence;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RecepcionMP.Infrastructure.Repositories
{
    public class RecepcionDocumentoRepository : IRecepcionDocumentoRepository
    {
        private readonly ApplicationDbContext _context;

        public RecepcionDocumentoRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(RecepcionDocumento documento)
        {
            await _context.RecepcionesDocumentos.AddAsync(documento);
            await _context.SaveChangesAsync();
        }

        public async Task EliminarAsync(int id)
        {
            var doc = await _context.RecepcionesDocumentos.FindAsync(id);
            if (doc == null) return;
            _context.RecepcionesDocumentos.Remove(doc);
            await _context.SaveChangesAsync();
        }

        public async Task<RecepcionDocumento> GetByIdAsync(int id)
        {
            return await _context.RecepcionesDocumentos.FindAsync(id);
        }

        public async Task<IEnumerable<RecepcionDocumento>> GetPorRecepcionAsync(int recepcionId)
        {
            return await _context.RecepcionesDocumentos
                .Where(d => d.RecepcionId == recepcionId)
                .OrderByDescending(d => d.FechaCarga)
                .ToListAsync();
        }

        public async Task<IEnumerable<RecepcionDocumento>> GetPorTipoDocumentoAsync(int documentoRequeridoId)
        {
            return await _context.RecepcionesDocumentos
                .Where(d => d.DocumentoRequeridoId == documentoRequeridoId)
                .ToListAsync();
        }

        public async Task UpdateAsync(RecepcionDocumento documento)
        {
            _context.RecepcionesDocumentos.Update(documento);
            await _context.SaveChangesAsync();
        }
    }
}