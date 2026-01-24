using RecepcionMP.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RecepcionMP.Application.Interfaces
{
    public interface IDocumentoAdjuntoRepository
    {
        Task<DocumentoAdjunto> GetByIdAsync(int id);
        Task<IEnumerable<DocumentoAdjunto>> GetPorRecepcionDocumentoAsync(int recepcionDocumentoId);
        Task<DocumentoAdjunto> GetPorHashAsync(string hash);
        Task<IEnumerable<DocumentoAdjunto>> GetPendientesEliminacionAsync();
        Task AddAsync(DocumentoAdjunto adjunto);
        Task UpdateAsync(DocumentoAdjunto adjunto);
        Task EliminarAsync(int id);
        Task<bool> ValidarIntegridadAsync(int id);
    }
}
