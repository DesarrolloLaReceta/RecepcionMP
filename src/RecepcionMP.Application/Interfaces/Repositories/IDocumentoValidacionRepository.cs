using RecepcionMP.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RecepcionMP.Application.Interfaces
{
    public interface IDocumentoValidacionRepository
    {
        Task<DocumentoValidacion> GetByIdAsync(int id);
        Task<IEnumerable<DocumentoValidacion>> GetPorRecepcionDocumentoAsync(int recepcionDocumentoId);
        Task<IEnumerable<DocumentoValidacion>> GetPorRecepcionAsync(int recepcionId);
        Task<IEnumerable<DocumentoValidacion>> GetRechazadosAsync(DateTime desde, DateTime hasta);
        Task<IEnumerable<DocumentoValidacion>> GetVencidosAsync();
        Task AddAsync(DocumentoValidacion validacion);
        Task UpdateAsync(DocumentoValidacion validacion);
    }
}
