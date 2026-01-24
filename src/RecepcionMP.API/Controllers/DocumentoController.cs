using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RecepcionMP.Application.DTOs.Documento;
using RecepcionMP.Application.Interfaces;
using System;
using System.Threading.Tasks;

namespace RecepcionMP.API.Controllers
{
    [ApiController]
    [Route("api/recepcion/{recepcionId:int}/documentos")]
    public class DocumentoController : ControllerBase
    {
        private readonly IDocumentoService _documentoService;
        private readonly IRecepcionDocumentoRepository _recepcionDocumentoRepository;
        private readonly IDocumentoValidacionRepository _validacionRepository;

        public DocumentoController(
            IDocumentoService documentoService,
            IRecepcionDocumentoRepository recepcionDocumentoRepository,
            IDocumentoValidacionRepository validacionRepository)
        {
            _documentoService = documentoService;
            _recepcionDocumentoRepository = recepcionDocumentoRepository;
            _validacionRepository = validacionRepository;
        }

        /// <summary>
        /// Sube un documento a una recepción
        /// </summary>
        [HttpPost("upload")]
        public async Task<IActionResult> SubirDocumento(int recepcionId, [FromForm] IFormFile file, [FromForm] int documentoRequeridoId)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Archivo requerido");

            try
            {
                var usuario = User?.Identity?.Name ?? "system";
                using var stream = file.OpenReadStream();

                var documento = await _documentoService.SubirDocumentoAsync(
                    recepcionId,
                    documentoRequeridoId,
                    stream,
                    file.FileName,
                    file.ContentType,
                    usuario);

                return CreatedAtAction(nameof(ObtenerDocumento), new { recepcionId, documentoId = documento.Id }, new
                {
                    id = documento.Id,
                    nombre = documento.NombreArchivo,
                    hash = documento.Hash,
                    tamaño = documento.TamañoBytes
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Error al subir documento: " + ex.Message });
            }
        }

        /// <summary>
        /// Obtiene todos los documentos de una recepción
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> ObtenerDocumentosPorRecepcion(int recepcionId)
        {
            var documentos = await _documentoService.ObtenerDocumentosPorRecepcionAsync(recepcionId);
            return Ok(documentos);
        }

        /// <summary>
        /// Obtiene un documento específico
        /// </summary>
        [HttpGet("{documentoId:int}")]
        public async Task<IActionResult> ObtenerDocumento(int recepcionId, int documentoId)
        {
            var documento = await _recepcionDocumentoRepository.GetByIdAsync(documentoId);
            if (documento == null || documento.RecepcionId != recepcionId)
                return NotFound();

            return Ok(documento);
        }

        /// <summary>
        /// Descarga un documento del storage
        /// </summary>
        [HttpGet("{documentoId:int}/descargar")]
        public async Task<IActionResult> DescargarDocumento(int recepcionId, int documentoId)
        {
            try
            {
                var stream = await _documentoService.DescargarDocumentoAsync(documentoId);
                var documento = await _recepcionDocumentoRepository.GetByIdAsync(documentoId);
                return File(stream, documento.TipoMime, documento.NombreArchivo);
            }
            catch (FileNotFoundException)
            {
                return NotFound("Archivo no encontrado");
            }
            catch (KeyNotFoundException)
            {
                return NotFound("Documento no encontrado");
            }
        }

        /// <summary>
        /// Valida un documento formalmente
        /// </summary>
        [HttpPost("{documentoId:int}/validar")]
        public async Task<IActionResult> ValidarDocumento(int recepcionId, int documentoId, [FromBody] ValidarDocumentoRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var usuario = User?.Identity?.Name ?? "system";
                var validacion = await _documentoService.ValidarDocumentoFormalAsync(
                    documentoId,
                    request.EsValido,
                    request.Observaciones,
                    usuario,
                    request.MotivoRechazo);

                return Ok(new DocumentoValidacionDto
                {
                    Id = validacion.Id,
                    RecepcionDocumentoId = validacion.RecepcionDocumentoId,
                    Estado = validacion.Estado.ToString(),
                    EsValido = validacion.EsValido,
                    Observaciones = validacion.Observaciones,
                    MotivoRechazo = validacion.MotivoRechazo,
                    ValidadoPor = validacion.ValidadoPor,
                    FechaValidacion = validacion.FechaValidacion
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Valida documentos requeridos faltantes
        /// </summary>
        [HttpGet("requeridos-faltantes")]
        public async Task<IActionResult> ValidarDocumentosFaltantes(int recepcionId, [FromQuery] int categoriaId)
        {
            var faltantes = await _documentoService.ValidarDocumentosRequeridosAsync(recepcionId, categoriaId);
            return Ok(faltantes);
        }

        /// <summary>
        /// Obtiene documentos vencidos
        /// </summary>
        [HttpGet("vencidos")]
        public async Task<IActionResult> ObtenerDocumentosVencidos()
        {
            var vencidos = await _documentoService.ObtenerDocumentosVencidosAsync();
            return Ok(vencidos);
        }
    }

    public class ValidarDocumentoRequest
    {
        public bool EsValido { get; set; }
        public string Observaciones { get; set; }
        public string MotivoRechazo { get; set; }
    }
}