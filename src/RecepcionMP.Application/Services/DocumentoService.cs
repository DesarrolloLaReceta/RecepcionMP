using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using RecepcionMP.Application.Interfaces;
using RecepcionMP.Application.Interfaces.Repositories;
using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Application.Services
{
    public class DocumentoService : IDocumentoService
    {
        private readonly IDocumentStorage _storage;
        private readonly IRecepcionDocumentoRepository _recepcionDocumentoRepository;
        private readonly IDocumentoValidacionRepository _validacionRepository;
        private readonly IDocumentoAdjuntoRepository _adjuntoRepository;
        private readonly IDocumentoRequeridoRepository _docRequeridoRepository;
        private readonly ICategoriaRepository _categoriaRepository;

        // Configuración de validaciones
        private static readonly HashSet<string> MimeTypesAceptados = new()
        {
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/jpg",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        };

        private const long MaxTamañoBytes = 50 * 1024 * 1024; // 50 MB

        public DocumentoService(
            IDocumentStorage storage,
            IRecepcionDocumentoRepository recepcionDocumentoRepository,
            IDocumentoValidacionRepository validacionRepository,
            IDocumentoAdjuntoRepository adjuntoRepository,
            IDocumentoRequeridoRepository docRequeridoRepository,
            ICategoriaRepository categoriaRepository)
        {
            _storage = storage;
            _recepcionDocumentoRepository = recepcionDocumentoRepository;
            _validacionRepository = validacionRepository;
            _adjuntoRepository = adjuntoRepository;
            _docRequeridoRepository = docRequeridoRepository;
            _categoriaRepository = categoriaRepository;
        }

        public async Task<RecepcionDocumento> SubirDocumentoAsync(int recepcionId, int documentoRequeridoId, Stream contenido, string nombreArchivo, string mimeType, string usuarioId)
        {
            if (contenido == null) throw new ArgumentNullException(nameof(contenido));
            if (string.IsNullOrEmpty(nombreArchivo)) throw new ArgumentException("Nombre de archivo requerido");

            // Validar tamaño
            if (contenido.Length > MaxTamañoBytes)
                throw new InvalidOperationException($"El archivo excede el tamaño máximo de 50 MB");

            // Validar MIME type
            if (!MimeTypesAceptados.Contains(mimeType?.ToLower() ?? ""))
                throw new InvalidOperationException($"Tipo de archivo no permitido: {mimeType}");

            // Calcular hash SHA256
            using var sha = SHA256.Create();
            contenido.Position = 0;
            var hashBytes = sha.ComputeHash(contenido);
            var hash = BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();

            // Verificar duplicado por hash
            var duplicado = await _adjuntoRepository.GetPorHashAsync(hash);
            if (duplicado != null)
                throw new InvalidOperationException("Un archivo con el mismo contenido ya existe (Hash duplicado)");

            // Subir a storage
            contenido.Position = 0;
            var ruta = await _storage.UploadAsync(contenido, nombreArchivo, "recepcion-documentos");

            // Crear registro de RecepcionDocumento
            var doc = new RecepcionDocumento
            {
                RecepcionId = recepcionId,
                DocumentoRequeridoId = documentoRequeridoId,
                NombreArchivo = nombreArchivo,
                RutaAlmacenamiento = ruta,
                Hash = hash,
                TamañoBytes = contenido.Length,
                TipoMime = mimeType,
                FechaCarga = DateTime.UtcNow,
                CargadoPor = usuarioId,
                Estado = EstadoDocumento.Recibido
            };

            await _recepcionDocumentoRepository.AddAsync(doc);

            // Crear registro de DocumentoAdjunto (metadatos adicionales)
            var adjunto = new DocumentoAdjunto
            {
                RecepcionDocumentoId = doc.Id,
                NombreArchivoOriginal = nombreArchivo,
                NombreArchivoAlmacenado = Path.GetFileName(ruta),
                RutaCompleta = ruta,
                TipoMime = mimeType,
                TamañoBytes = contenido.Length,
                HashSHA256 = hash,
                IntegridadVerificada = true,
                FechaCarga = DateTime.UtcNow,
                CargadoPor = usuarioId
            };

            await _adjuntoRepository.AddAsync(adjunto);

            return doc;
        }

        public async Task<(bool esValido, string motivo)> ValidarConformidadDocumentoAsync(RecepcionDocumento documento, DocumentoRequerido tipoDocumento)
        {
            if (documento == null) return (false, "Documento no encontrado");

            // 1. Validar MIME type
            if (!MimeTypesAceptados.Contains(documento.TipoMime?.ToLower() ?? ""))
                return (false, $"Formato no permitido: {documento.TipoMime}");

            // 2. Validar tamaño
            if (documento.TamañoBytes > MaxTamañoBytes)
                return (false, $"Archivo excede tamaño máximo (50 MB)");

            // 3. Validar vigencia del documento requerido
            if (tipoDocumento.VigenciaDias.HasValue)
            {
                var fechaVencimiento = documento.FechaCarga.AddDays(tipoDocumento.VigenciaDias.Value);
                if (fechaVencimiento < DateTime.UtcNow)
                    return (false, $"Documento vencido (vigencia: {tipoDocumento.VigenciaDias} días desde carga)");
            }

            // 4. Validar integridad
            var adjunto = (await _adjuntoRepository.GetPorRecepcionDocumentoAsync(documento.Id)).FirstOrDefault();
            if (adjunto != null && !adjunto.IntegridadVerificada)
                return (false, "Integridad del archivo no verificada");

            return (true, "Documento válido");
        }

        public async Task<IEnumerable<RecepcionDocumento>> ObtenerDocumentosPorRecepcionAsync(int recepcionId)
        {
            var documentos = await _recepcionDocumentoRepository.GetPorRecepcionAsync(recepcionId);
            return documentos;
        }

        public async Task<IEnumerable<DocumentoRequerido>> ValidarDocumentosRequeridosAsync(int recepcionId, int categoriaId)
        {
            // Obtener documentos obligatorios por categoría
            var documentosObligatorios = await _docRequeridoRepository.GetObligatoriosPorCategoriaAsync(categoriaId);

            // Obtener documentos cargados en la recepción
            var documentosCargados = await _recepcionDocumentoRepository.GetPorRecepcionAsync(recepcionId);
            var docsCargadosIds = documentosCargados.Select(d => d.DocumentoRequeridoId).ToHashSet();

            // Retornar los que faltan
            return documentosObligatorios.Where(d => !docsCargadosIds.Contains(d.Id));
        }

        public async Task<DocumentoValidacion> ValidarDocumentoFormalAsync(int recepcionDocumentoId, bool esValido, string observaciones, string validadoPor, string motivoRechazo = null)
        {
            var recepcionDoc = await _recepcionDocumentoRepository.GetByIdAsync(recepcionDocumentoId);
            if (recepcionDoc == null) throw new KeyNotFoundException("Documento no encontrado");

            var validacion = new DocumentoValidacion
            {
                RecepcionDocumentoId = recepcionDocumentoId,
                DocumentoRequeridoId = recepcionDoc.DocumentoRequeridoId,
                EsValido = esValido,
                Estado = esValido 
                    ? EstadoValidacionDocumento.ValidoOK 
                    : (motivoRechazo?.Contains("vencid", StringComparison.OrdinalIgnoreCase) ?? false 
                        ? EstadoValidacionDocumento.RechazadoVencido 
                        : EstadoValidacionDocumento.RechazadoOtro),
                ResultadoValidacion = esValido ? "Validación exitosa" : "Validación fallida",
                Observaciones = observaciones,
                MotivoRechazo = motivoRechazo,
                ValidadoPor = validadoPor,
                FechaValidacion = DateTime.UtcNow,
                EstaVigente = esValido
            };

            await _validacionRepository.AddAsync(validacion);

            // Actualizar estado del RecepcionDocumento
            recepcionDoc.Estado = esValido ? EstadoDocumento.ValidadoOK : EstadoDocumento.RechazadoContenido;
            recepcionDoc.ObservacionesValidacion = observaciones;
            await _recepcionDocumentoRepository.UpdateAsync(recepcionDoc);

            return validacion;
        }

        public async Task<Stream> DescargarDocumentoAsync(int recepcionDocumentoId)
        {
            var doc = await _recepcionDocumentoRepository.GetByIdAsync(recepcionDocumentoId);
            if (doc == null) throw new KeyNotFoundException("Documento no encontrado");

            var stream = await _storage.DownloadAsync(doc.RutaAlmacenamiento);
            if (stream == null) throw new FileNotFoundException("Archivo no encontrado en storage");

            return stream;
        }

        public async Task<IEnumerable<DocumentoValidacion>> ObtenerDocumentosVencidosAsync()
        {
            return await _validacionRepository.GetVencidosAsync();
        }

        public async Task<IEnumerable<DocumentoRequerido>> ObtenerDocumentosRequeridosFaltantesAsync(int recepcionId, int categoriaId)
        {
            // Obtener documentos obligatorios por categoría
            var documentosObligatorios = await _docRequeridoRepository.GetObligatoriosPorCategoriaAsync(categoriaId);

            // Obtener documentos cargados Y validados en la recepción
            var documentosCargados = await _recepcionDocumentoRepository.GetPorRecepcionAsync(recepcionId);
            var docsValidadosIds = documentosCargados
                .Where(d => d.Estado == EstadoDocumento.ValidadoOK)
                .Select(d => d.DocumentoRequeridoId)
                .ToHashSet();

            // Retornar los que faltan o aún no están validados
            return documentosObligatorios.Where(d => !docsValidadosIds.Contains(d.Id));
        }
    }
}