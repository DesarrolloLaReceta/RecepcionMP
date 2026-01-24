using Microsoft.AspNetCore.Mvc;
using RecepcionMP.Application.DTOs;
using RecepcionMP.Application.Interfaces;
using RecepcionMP.Domain.Entities;

namespace RecepcionMP.API.Controllers;

/// <summary>
/// Gestión de flujo de calidad: liberación, rechazo, no conformidades y acciones correctivas
/// Integrado con validación de documentos y checklist BPM
/// </summary>
[ApiController]
[Route("api/recepcion/{recepcionId:int}/calidad")]
public class CalidadController : ControllerBase
{
    private readonly ICalidadService _calidadService;
    private readonly ILogger<CalidadController> _logger;

    public CalidadController(ICalidadService calidadService, ILogger<CalidadController> logger)
    {
        _calidadService = calidadService;
        _logger = logger;
    }

    /// <summary>
    /// Libera un lote tras validar documentos, checklist y no conformidades
    /// </summary>
    [HttpPost("lotes/{loteId:int}/liberar")]
    public async Task<IActionResult> LiberarLote(int recepcionId, int loteId, [FromBody] LiberarLoteDto request)
    {
        try
        {
            var usuarioId = User?.Identity?.Name ?? "system";
            var liberacion = await _calidadService.LiberarLoteAsync(
                loteId,
                usuarioId,
                request?.Observaciones ?? "");

            _logger.LogInformation($"Lote {loteId} liberado por {usuarioId}");
            return Ok(MapLiberacionToDto(liberacion));
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning($"Lote/Recepción no encontrado: {ex.Message}");
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"No se puede liberar el lote: {ex.Message}");
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al liberar lote: {ex.Message}");
            return StatusCode(500, new { error = "Error interno al procesar liberación" });
        }
    }

    /// <summary>
    /// Rechaza un lote con motivo auditable
    /// </summary>
    [HttpPost("lotes/{loteId:int}/rechazar")]
    public async Task<IActionResult> RechazarLote(int recepcionId, int loteId, [FromBody] RechazarLoteDto request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request?.Motivo))
                return BadRequest(new { error = "Motivo de rechazo es requerido" });

            var usuarioId = User?.Identity?.Name ?? "system";
            var liberacion = await _calidadService.RechazarLoteAsync(loteId, usuarioId, request.Motivo);

            _logger.LogInformation($"Lote {loteId} rechazado por {usuarioId}");
            return Ok(MapLiberacionToDto(liberacion));
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning($"Lote/Recepción no encontrado: {ex.Message}");
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al rechazar lote: {ex.Message}");
            return StatusCode(500, new { error = "Error interno al procesar rechazo" });
        }
    }

    /// <summary>
    /// Valida si un lote puede ser liberado (documentos, checklist, no conformidades)
    /// </summary>
    [HttpGet("lotes/{loteId:int}/puede-liberarse")]
    public async Task<IActionResult> ValidarLotePuedeLiberarse(int recepcionId, int loteId)
    {
        try
        {
            var (canLiberate, motivos) = await _calidadService.ValidarLotePuedeLiberarseAsync(loteId);
            return Ok(new ValidacionLiberacionDto
            {
                CanLiberate = canLiberate,
                Motivos = motivos
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al validar lote: {ex.Message}");
            return StatusCode(500, new { error = "Error interno" });
        }
    }

    /// <summary>
    /// Obtiene estado actual de liberación de un lote
    /// </summary>
    [HttpGet("lotes/{loteId:int}/estado-liberacion")]
    public async Task<IActionResult> ObtenerEstadoLiberacion(int recepcionId, int loteId)
    {
        try
        {
            var liberacion = await _calidadService.ObtenerLiberacionLoteAsync(loteId);
            if (liberacion == null)
                return NotFound(new { error = "Sin registro de liberación para este lote" });

            return Ok(MapLiberacionToDto(liberacion));
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al obtener estado: {ex.Message}");
            return StatusCode(500, new { error = "Error interno" });
        }
    }

    /// <summary>
    /// Registra una no conformidad detectada en calidad
    /// </summary>
    [HttpPost("no-conformidades")]
    public async Task<IActionResult> CrearNoConformidad(int recepcionId, [FromBody] CrearNoConformidadDto request)
    {
        try
        {
            if (!Enum.TryParse<TipoNoConformidad>(request?.Tipo, out var tipo))
                return BadRequest(new { error = $"Tipo inválido. Use: Merma, RechazoParcial, RechazoTotal" });

            var usuarioId = User?.Identity?.Name ?? "system";
            var noConformidad = await _calidadService.CrearNoConformidadAsync(
                recepcionId,
                request.LoteId,
                tipo,
                request.Descripcion,
                request.CantidadAfectada,
                request.UnidadMedida,
                request.Causa,
                usuarioId);

            _logger.LogInformation($"No conformidad registrada: {noConformidad.Id}");
            return Created($"/api/recepcion/{recepcionId}/calidad/no-conformidades/{noConformidad.Id}",
                MapNoConformidadToDto(noConformidad));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al crear no conformidad: {ex.Message}");
            return StatusCode(500, new { error = "Error interno" });
        }
    }

    /// <summary>
    /// Obtiene todas las no conformidades de una recepción
    /// </summary>
    [HttpGet("no-conformidades")]
    public async Task<IActionResult> ObtenerNoConformidades(int recepcionId)
    {
        try
        {
            var noConformidades = await _calidadService.ObtenerNoConformidadesPorRecepcionAsync(recepcionId);
            return Ok(noConformidades.Select(MapNoConformidadToDto).ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al obtener no conformidades: {ex.Message}");
            return StatusCode(500, new { error = "Error interno" });
        }
    }

    /// <summary>
    /// Crea una acción correctiva para una no conformidad
    /// </summary>
    [HttpPost("no-conformidades/{noConformidadId:int}/acciones-correctivas")]
    public async Task<IActionResult> CrearAccionCorrectiva(
        int recepcionId,
        int noConformidadId,
        [FromBody] CrearAccionCorrectivaDto request)
    {
        try
        {
            var usuarioId = User?.Identity?.Name ?? "system";
            var accion = await _calidadService.CrearAccionCorrectivaAsync(
                noConformidadId,
                request.Descripcion,
                request.Responsable,
                request.FechaVencimiento,
                usuarioId);

            _logger.LogInformation($"Acción correctiva creada: {accion.Id}");
            return Created($"/api/recepcion/{recepcionId}/calidad/no-conformidades/{noConformidadId}/acciones/{accion.Id}",
                MapAccionToDto(accion));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al crear acción correctiva: {ex.Message}");
            return StatusCode(500, new { error = "Error interno" });
        }
    }

    /// <summary>
    /// Cierra una acción correctiva
    /// </summary>
    [HttpPost("acciones-correctivas/{accionId:int}/cerrar")]
    public async Task<IActionResult> CerrarAccionCorrectiva(
        int recepcionId,
        int accionId,
        [FromBody] CerrarAccionCorrectivaDto request)
    {
        try
        {
            var usuarioId = User?.Identity?.Name ?? "system";
            var accion = await _calidadService.CerrarAccionCorrectivaAsync(
                accionId,
                request?.ObservacionesCierre ?? "",
                usuarioId);

            _logger.LogInformation($"Acción correctiva cerrada: {accionId}");
            return Ok(MapAccionToDto(accion));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al cerrar acción: {ex.Message}");
            return StatusCode(500, new { error = "Error interno" });
        }
    }

    /// <summary>
    /// Obtiene acciones correctivas abiertas
    /// </summary>
    [HttpGet("acciones-correctivas/abiertas")]
    public async Task<IActionResult> ObtenerAccionesAbiertas(int recepcionId)
    {
        try
        {
            var acciones = await _calidadService.ObtenerAccionesCorrectivasAbiertasAsync();
            return Ok(acciones.Select(MapAccionToDto).ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al obtener acciones abiertas: {ex.Message}");
            return StatusCode(500, new { error = "Error interno" });
        }
    }

    /// <summary>
    /// Obtiene acciones correctivas vencidas
    /// </summary>
    [HttpGet("acciones-correctivas/vencidas")]
    public async Task<IActionResult> ObtenerAccionesVencidas(int recepcionId)
    {
        try
        {
            var acciones = await _calidadService.ObtenerAccionesCorrectivasVencidaspAsync();
            return Ok(acciones.Select(MapAccionToDto).ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al obtener acciones vencidas: {ex.Message}");
            return StatusCode(500, new { error = "Error interno" });
        }
    }

    // Mapeos
    private NoConformidadDto MapNoConformidadToDto(NoConformidad nc)
    {
        var dto = new NoConformidadDto
        {
            Id = nc.Id,
            RecepcionId = nc.RecepcionId,
            LoteId = nc.LoteId,
            Tipo = nc.Tipo.ToString(),
            Descripcion = nc.Descripcion,
            CantidadAfectada = nc.CantidadAfectada,
            UnidadMedida = nc.UnidadMedida,
            Causa = nc.Causa,
            FechaRegistro = nc.FechaRegistro,
            Estado = nc.Estado.ToString(),
            RegistradoPor = nc.RegistradoPor,
            AccionesCorrectivasCount = nc.AccionesCorrectivas?.Count ?? 0
        };
        return dto;
    }

    private AccionCorrectivaDto MapAccionToDto(AccionCorrectiva ac)
    {
        return new AccionCorrectivaDto
        {
            Id = ac.Id,
            NoConformidadId = ac.NoConformidadId,
            Descripcion = ac.Descripcion,
            Responsable = ac.Responsable,
            FechaCreacion = ac.FechaCreacion,
            FechaVencimiento = ac.FechaVencimiento,
            FechaCompletacion = ac.FechaCompletacion,
            Estado = ac.Estado.ToString(),
            Observaciones = ac.Observaciones,
            CreadaPor = ac.CreadaPor,
            CerradaPor = ac.CerradaPor,
            EstaVencida = ac.EstaVencida(),
            DíasRestantes = ac.DíasRestantes()
        };
    }

    private LiberacionLoteDto MapLiberacionToDto(LiberacionLote ll)
    {
        return new LiberacionLoteDto
        {
            Id = ll.Id,
            LoteId = ll.LoteId,
            RecepcionId = ll.RecepcionId,
            Estado = ll.Estado.ToString(),
            FechaDecision = ll.FechaDecision,
            LiberadoPor = ll.LiberadoPor,
            Observaciones = ll.Observaciones,
            MotivoRechazo = ll.MotivoRechazo
        };
    }
}
