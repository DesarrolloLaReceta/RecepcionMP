using SistemaRecepcionMP.Application.Features.Items.Commands.ActualizarItem;
using SistemaRecepcionMP.Application.Features.Items.Commands.CrearItem;
using SistemaRecepcionMP.Application.Features.Items.Queries;
using Microsoft.AspNetCore.Mvc;

namespace SistemaRecepcionMP.API.Controllers;

public sealed class ItemsController : BaseController
{
    // ── Queries ───────────────────────────────────────────────────────────────

    /// <summary>Lista todos los ítems. Por defecto solo los activos.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] bool soloActivos = true,
        CancellationToken ct = default)
    {
        var result = await Mediator.Send(
            new GetItemsListQuery { SoloActivos = soloActivos }, ct);
        return Ok(result);
    }

    /// <summary>Obtiene un ítem por su ID con el detalle de categoría.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetItemByIdQuery(id), ct);
        return Ok(result);
    }

    /// <summary>Lista los ítems de una categoría específica.</summary>
    [HttpGet("por-categoria/{categoriaId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByCategoria(
        Guid categoriaId,
        CancellationToken ct = default)
    {
        var result = await Mediator.Send(
            new GetItemsByCategoriaQuery(categoriaId), ct);
        return Ok(result);
    }

    // ── Commands ──────────────────────────────────────────────────────────────

    /// <summary>Crea un nuevo ítem de materia prima.</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Crear(
        [FromBody] CrearItemCommand command,
        CancellationToken ct = default)
    {
        var id = await Mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    /// <summary>Actualiza los datos de un ítem existente. No permite cambiar el código interno.</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Actualizar(
        Guid id,
        [FromBody] ActualizarItemCommand command,
        CancellationToken ct = default)
    {
        command.Id = id;
        await Mediator.Send(command, ct);
        return NoContent();
    }
}