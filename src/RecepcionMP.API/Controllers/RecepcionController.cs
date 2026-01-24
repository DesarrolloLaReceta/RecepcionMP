using Microsoft.AspNetCore.Mvc;
using RecepcionMP.Application.DTOs;
using RecepcionMP.Application.Interfaces;

namespace RecepcionMP.API.Controllers
{
    [ApiController]
    [Route("api/recepcion")]
    public class RecepcionController : ControllerBase
    {
        private readonly IRecepcionService _service;
        private readonly IDocumentoService _documentoService;
        private readonly ICalidadService _calidadService;

        public RecepcionController(
            IRecepcionService service,
            IDocumentoService documentoService,
            ICalidadService calidadService)
        {
            _service = service;
            _documentoService = documentoService;
            _calidadService = calidadService;
        }

        // POST: /api/recepcion
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateRecepcionDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var id = await _service.CrearAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id }, null);
        }

        // GET: /api/recepcion/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var recepcion = await _service.ObtenerPorIdAsync(id);
            if (recepcion == null) return NotFound();
            return Ok(recepcion);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var recepciones = await _service.ObtenerTodosAsync();
            return Ok(recepciones);
        }


        // PUT: /api/recepcion/{id}/liberar-lote
        [HttpPut("{id:int}/liberar-lote")]
        public async Task<IActionResult> LiberarLote(int id, [FromBody] LiberarLoteRequest request)
        {
            if (request == null || request.LoteId <= 0)
                return BadRequest(new { error = "LoteId is required" });

            try
            {
                var usuarioId = User?.Identity?.Name ?? "system";
                var liberacion = await _calidadService.LiberarLoteAsync(request.LoteId, usuarioId, request.Observaciones ?? "");
                return Ok(liberacion);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // PUT: /api/recepcion/{id}/rechazar
        [HttpPut("{id:int}/rechazar")]
        public async Task<IActionResult> Rechazar(int id, [FromBody] RechazarLoteRequest request)
        {
            if (request == null || request.LoteId <= 0 || string.IsNullOrWhiteSpace(request.Motivo))
                return BadRequest(new { error = "LoteId and Motivo are required" });

            try
            {
                var usuarioId = User?.Identity?.Name ?? "system";
                var resultado = await _calidadService.RechazarLoteAsync(request.LoteId, usuarioId, request.Motivo);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // POST: /api/recepcion/{id}/documentos
        [HttpPost("{id:int}/documentos")]
        public async Task<IActionResult> UploadDocumento(int id, [FromForm] IFormFile file, [FromForm] int documentoRequeridoId)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Archivo requerido");

            try
            {
                var usuario = User?.Identity?.Name ?? "system";
                using var stream = file.OpenReadStream();

                var documento = await _documentoService.SubirDocumentoAsync(
                    id,
                    documentoRequeridoId,
                    stream,
                    file.FileName,
                    file.ContentType,
                    usuario);

                return CreatedAtAction("GetDocumento", new { id, documentoId = documento.Id }, new { documento.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        public class LiberarLoteRequest
        {
            public int LoteId { get; set; }
            public string? Observaciones { get; set; }
        }

        public class RechazarLoteRequest
        {
            public int LoteId { get; set; }
            public string? Motivo { get; set; }
        }
    }
}
