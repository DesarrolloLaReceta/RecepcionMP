using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Application.Interfaces
{
    public interface IDocumentoService
    {
        /// <summary>
        /// Valida qué documentos requeridos faltan para una recepción
        /// </summary>
        Task<IEnumerable<DocumentoRequerido>> ValidarDocumentosRequeridosAsync(int recepcionId, int categoriaId);

        /// <summary>
        /// Sube un documento a una recepción, calcula hash y registra metadatos
        /// </summary>
        Task<RecepcionDocumento> SubirDocumentoAsync(int recepcionId, int documentoRequeridoId, Stream contenido, string nombreArchivo, string mimeType, string usuarioId);

        /// <summary>
        /// Valida conformidad del documento (tipo MIME, tamaño, vigencia)
        /// </summary>
        Task<(bool esValido, string motivo)> ValidarConformidadDocumentoAsync(RecepcionDocumento documento, DocumentoRequerido tipoDocumento);

        /// <summary>
        /// Obtiene todos los documentos de una recepción con validaciones
        /// </summary>
        Task<IEnumerable<RecepcionDocumento>> ObtenerDocumentosPorRecepcionAsync(int recepcionId);

        /// <summary>
        /// Registra validación formal de un documento
        /// </summary>
        Task<DocumentoValidacion> ValidarDocumentoFormalAsync(int recepcionDocumentoId, bool esValido, string observaciones, string validadoPor, string motivoRechazo = null);

        /// <summary>
        /// Descarga un documento del storage
        /// </summary>
        Task<Stream> DescargarDocumentoAsync(int recepcionDocumentoId);

        /// <summary>
        /// Obtiene documentos vencidos
        /// </summary>
        Task<IEnumerable<DocumentoValidacion>> ObtenerDocumentosVencidosAsync();

        /// <summary>
        /// Obtiene documentos requeridos que faltan para una recepción
        /// </summary>
        Task<IEnumerable<DocumentoRequerido>> ObtenerDocumentosRequeridosFaltantesAsync(int recepcionId, int categoriaId);
    }
}