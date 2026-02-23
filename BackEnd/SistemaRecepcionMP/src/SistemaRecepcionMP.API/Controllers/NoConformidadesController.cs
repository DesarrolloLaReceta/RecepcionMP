using SistemaRecepcionMP.Application.Features.NoConformidades.Commands;
using SistemaRecepcionMP.Application.Features.NoConformidades.Queries;
using SistemaRecepcionMP.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace SistemaRecepcionMP.API.Controllers;

public sealed class NoConformidadesController : BaseController
{
    // ── Queries ───────────────────────────────────────────────────────────────

    /// <summary>
    /// Lista no conformidades abiertas y en gestión.
    /// Permite filtrar por tipo y detectar acciones correctivas vencidas.
    /// </summary>
    [HttpGet("abiertas")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAbiertas(
        [FromQuery] TipoNoConformidad? tipo = null,
        [FromQuery] bool soloConAccionesVencidas = false,
        CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetNoConformidadesAbiertasQuery
        {
            Tipo = tipo,
            SoloConAccionesVencidas = soloConAccionesVencidas
        }, ct);
        return Ok(result);
    }

    /// <summary>
    /// Lista todas las no conformidades de un lote específico.
    /// Incluye sus acciones correctivas y estado de cierre.
    /// </summary>
    [HttpGet("por-lote/{loteId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByLote(
        Guid loteId,
        CancellationToken ct = default)
    {
        var result = await Mediator.Send(
            new GetNoConformidadesByLoteQuery(loteId), ct);
        return Ok(result);
    }

    // ── Commands ──────────────────────────────────────────────────────────────

    /// <summary>
    /// Crea una no conformidad para un lote.
    /// Requiere especificar la causal, tipo, descripción y cantidad afectada.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> Crear(
        [FromBody] CrearNoConformidadCommand command,
        CancellationToken ct = default)
    {
        var id = await Mediator.Send(command, ct);
        return Created(string.Empty, new { id });
    }

    /// <summary>
    /// Agrega una acción correctiva a una no conformidad existente.
    /// La NC pasa automáticamente a estado EnGestión.
    /// La fecha de compromiso debe ser futura.
    /// </summary>
    [HttpPost("{id:guid}/acciones-correctivas")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> CrearAccionCorrectiva(
        Guid id,
        [FromBody] CrearAccionCorrectivaCommand command,
        CancellationToken ct = default)
    {
        command.NoConformidadId = id;
        var accionId = await Mediator.Send(command, ct);
        return Created(string.Empty, new { id = accionId });
    }

    /// <summary>
    /// Cierra una acción correctiva con su evidencia.
    /// Si es la última acción pendiente, la no conformidad queda cerrada.
    /// Requiere adjuntar la URL de la evidencia del cierre.
    /// </summary>
    [HttpPost("{id:guid}/acciones-correctivas/{accionId:guid}/cerrar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> CerrarAccionCorrectiva(
        Guid id,
        Guid accionId,
        [FromBody] CerrarNoConformidadCommand command,
        CancellationToken ct = default)
    {
        command.NoConformidadId = id;
        command.AccionCorrectivaId = accionId;
        await Mediator.Send(command, ct);
        return NoContent();
    }
}