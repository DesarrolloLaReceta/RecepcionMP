using Microsoft.EntityFrameworkCore;
using RecepcionMP.Application.Interfaces;
using RecepcionMP.Application.Interfaces.Repositories;
using RecepcionMP.Domain.Entities;
using RecepcionMP.Infrastructure.Persistence;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RecepcionMP.Infrastructure.Repositories
{
    public class DocumentoRequeridoRepository : IDocumentoRequeridoRepository
    {
        private readonly ApplicationDbContext _context;

        public DocumentoRequeridoRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(DocumentoRequerido documento)
        {
            await _context.DocumentosRequeridos.AddAsync(documento);
            await _context.SaveChangesAsync();
        }

        public async Task CrearVersionAsync(DocumentoRequerido documentoAnterior)
        {
            // clone documentoAnterior to a new version (simple strategy)
            var nueva = new DocumentoRequerido
            {
                CategoriaId = documentoAnterior.CategoriaId,
                TipoDocumento = documentoAnterior.TipoDocumento,
                Nombre = documentoAnterior.Nombre,
                Descripcion = documentoAnterior.Descripcion,
                EsObligatorio = documentoAnterior.EsObligatorio,
                VigenciaDias = documentoAnterior.VigenciaDias,
                Activo = documentoAnterior.Activo,
                Versión = documentoAnterior.Versión + 1,
                FechaVigencia = documentoAnterior.FechaVigencia
            };
            await _context.DocumentosRequeridos.AddAsync(nueva);
            await _context.SaveChangesAsync();
        }

        public async Task<DocumentoRequerido> GetByIdAsync(int id)
        {
            return await _context.DocumentosRequeridos.FindAsync(id);
        }

        public async Task<IEnumerable<DocumentoRequerido>> GetObligatoriosPorCategoriaAsync(int categoriaId)
        {
            return await _context.DocumentosRequeridos
                .Where(d => d.CategoriaId == categoriaId && d.EsObligatorio && d.Activo)
                .ToListAsync();
        }

        public async Task<IEnumerable<DocumentoRequerido>> GetPorCategoriaAsync(int categoriaId)
        {
            return await _context.DocumentosRequeridos
                .Where(d => d.CategoriaId == categoriaId && d.Activo)
                .ToListAsync();
        }

        public async Task UpdateAsync(DocumentoRequerido documento)
        {
            _context.DocumentosRequeridos.Update(documento);
            await _context.SaveChangesAsync();
        }
    }
}