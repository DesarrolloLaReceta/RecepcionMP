using SistemaRecepcionMP.Application.Features.Checklists.Commands;
using SistemaRecepcionMP.Application.Features.Checklists.Queries;
using Microsoft.AspNetCore.Mvc;

namespace SistemaRecepcionMP.API.Controllers;

public sealed class ChecklistsController : BaseController
{
    // ── Queries ───────────────────────────────────────────────────────────────
    /// <summary>
    /// Obtiene todos los checklists BPM.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetChecklistsListQuery(), ct);
        return Ok(result);
    }

    /// <summary>
    /// Obtiene un checklist BPM por su ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetChecklistByIdQuery(id), ct);
        return Ok(result);
    }

    /// <summary>
    /// Obtiene el checklist BPM activo para una categoría de ítem.
    /// Usado antes de registrar los resultados de inspección de un lote.
    /// </summary>
    [HttpGet("por-categoria/{categoriaId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByCategoria(
        Guid categoriaId,
        CancellationToken ct = default)
    {
        var result = await Mediator.Send(
            new GetChecklistByCategoriaQuery(categoriaId), ct);
        return Ok(result);
    }

    /// <summary>
    /// Obtiene todos los resultados de checklist registrados para un lote.
    /// Incluye cada ítem evaluado, su resultado y observaciones.
    /// </summary>
    [HttpGet("resultados/por-lote/{loteId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetResultadosByLote(
        Guid loteId,
        CancellationToken ct = default)
    {
        var result = await Mediator.Send(
            new GetResultadosByLoteQuery(loteId), ct);
        return Ok(result);
    }

    // ── Commands ──────────────────────────────────────────────────────────────

    /// <summary>
    /// Crea un nuevo checklist BPM para una categoría.
    /// Si ya existe uno activo, se versiona automáticamente y el anterior queda inactivo.
    /// Solo Administrador puede crear checklists.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Crear(
        [FromBody] CrearChecklistCommand command,
        CancellationToken ct = default)
    {
        var id = await Mediator.Send(command, ct);
        return Created(string.Empty, new { id });
    }

    /// <summary>
    /// Registra los resultados del checklist BPM para un lote.
    /// Si algún ítem crítico no cumple, el lote entra automáticamente a cuarentena.
    /// Debe incluir un resultado para cada ítem del checklist.
    /// </summary>
    [HttpPost("resultados")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> RegistrarResultados(
        [FromBody] RegistrarResultadoChecklistCommand command,
        CancellationToken ct = default)
    {
        await Mediator.Send(command, ct);
        return NoContent();
    }

    /// <summary>
    /// Actualiza los criterios de un checklist BPM.
    /// </summary>
    [HttpPut("{id:guid}/criterios")]
    public async Task<IActionResult> ActualizarCriterios(
        Guid id,
        [FromBody] ActualizarCriteriosCommand command,
        CancellationToken ct = default)
    {
        command.ChecklistId = id;
        await Mediator.Send(command, ct);
        return NoContent();
    }

    /// <summary>
    /// Publica un checklist BPM.
    /// </summary>
    [HttpPost("{id:guid}/publicar")]
    public async Task<IActionResult> Publicar(Guid id, CancellationToken ct = default)
    {
        await Mediator.Send(new PublicarChecklistCommand { ChecklistId = id }, ct);
        return NoContent();
    }
}