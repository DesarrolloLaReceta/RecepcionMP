using SistemaRecepcionMP.Application.Features.Recepciones.Commands.AdjuntarDocumento;
using SistemaRecepcionMP.Application.Features.Recepciones.Commands;
using SistemaRecepcionMP.Application.Features.Recepciones.Queries;
using SistemaRecepcionMP.API.Models;
using Microsoft.AspNetCore.Mvc;

namespace SistemaRecepcionMP.API.Controllers;

public sealed class LotesController : BaseController
{
    // ── Queries ───────────────────────────────────────────────────────────────

    /// <summary>
    /// Obtiene la trazabilidad completa de un lote: origen, condiciones de ingreso,
    /// inspecciones, temperaturas, checklist, no conformidades y decisión de calidad.
    /// Endpoint principal para cumplimiento INVIMA / Res. 2674.
    /// </summary>
    [HttpGet("{id:guid}/trazabilidad")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTrazabilidad(Guid id, CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetTrazabilidadLoteQuery(id), ct);
        return Ok(result);
    }

    /// <summary>
    /// Retorna todos los lotes pendientes de liberación por Calidad.
    /// </summary>
    [HttpGet("pendientes-liberacion")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPendientesLiberacion(CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetLotesPendientesLiberacionQuery(), ct);
        return Ok(result);
    }

    // ── Commands ──────────────────────────────────────────────────────────────

    /// <summary>
    /// Libera o rechaza definitivamente un lote.
    /// Solo puede ser ejecutado por usuarios con perfil Calidad.
    /// Verifica que no existan no conformidades abiertas antes de liberar.
    /// </summary>
    [HttpPost("{id:guid}/liberar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> Liberar(
        Guid id,
        [FromBody] LiberarLoteCommand command,
        CancellationToken ct = default)
    {
        command.LoteId = id;
        await Mediator.Send(command, ct);
        return NoContent();
    }

    /// <summary>
    /// Rechaza un lote registrando una no conformidad con su causal.
    /// La cantidad afectada puede ser parcial (rechazo parcial).
    /// </summary>
    [HttpPost("{id:guid}/rechazar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> Rechazar(
        Guid id,
        [FromBody] RechazarLoteCommand command,
        CancellationToken ct = default)
    {
        command.LoteId = id;
        await Mediator.Send(command, ct);
        return NoContent();
    }

    /// <summary>
    /// Pone un lote en cuarentena con su motivo.
    /// Solo puede ser ejecutado por Calidad o Administrador.
    /// El lote queda bloqueado hasta que Calidad tome una decisión.
    /// </summary>
    [HttpPost("{id:guid}/cuarentena")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> PonerEnCuarentena(
        Guid id,
        [FromBody] PonerEnCuarentenaCommand command,
        CancellationToken ct = default)
    {
        command.LoteId = id;
        var cuarentenaId = await Mediator.Send(command, ct);
        return Created(string.Empty, new { id = cuarentenaId });
    }

    /// <summary>Registra una temperatura para un lote específico.</summary>
    [HttpPost("{id:guid}/temperaturas")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegistrarTemperatura(
        Guid id,
        [FromBody] RegistrarTemperaturaCommand command,
        CancellationToken ct = default)
    {
        command.LoteRecibidoId = id;
        command.RecepcionId = null;
        var registroId = await Mediator.Send(command, ct);
        return Created(string.Empty, new { id = registroId });
    }

    /// <summary>Adjunta un documento a un lote específico (CoA, ficha técnica, etc.).</summary>
    [HttpPost("{id:guid}/documentos")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AdjuntarDocumento(
        Guid id,
        [FromForm] AdjuntarDocumentoRecepcionRequest request,
        CancellationToken ct = default)
    {
        using var ms = new MemoryStream();
        await request.Archivo.CopyToAsync(ms, ct);

        var command = new AdjuntarDocumentoCommand
        {
            RecepcionId = null,
            LoteRecibidoId = id,
            TipoDocumento = request.TipoDocumento,
            NombreArchivo = request.Archivo.FileName,
            ContenidoArchivo = ms.ToArray()
        };

        var documentoId = await Mediator.Send(command, ct);
        return Created(string.Empty, new { id = documentoId });
    }
}