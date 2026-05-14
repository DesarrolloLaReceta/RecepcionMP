using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaRecepcionMP.Application.Features.Calidad.Commands.RegistrarLiberacionCocina;
using SistemaRecepcionMP.Application.Features.Calidad.DTOs;
using SistemaRecepcionMP.Application.Features.Calidad.Queries.LiberacionCocina;

namespace SistemaRecepcionMP.API.Controllers;

public sealed class LiberacionCocinaController : BaseController
{
    [HttpGet]
    [ProducesResponseType(typeof(List<LiberacionCocinaHistorialItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<LiberacionCocinaHistorialItemDto>>> GetList(CancellationToken ct = default)
    {
        var items = await Mediator.Send(new GetLiberacionesCocinaListQuery(), ct);
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(LiberacionCocinaDetalleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LiberacionCocinaDetalleDto>> GetById(int id, CancellationToken ct = default)
    {
        var dto = await Mediator.Send(new GetLiberacionCocinaByIdQuery(id), ct);
        if (dto is null)
            return NotFound();
        return Ok(dto);
    }

    [HttpPost]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Registrar(
        [FromBody] RegistrarLiberacionCocinaCommand command,
        CancellationToken ct = default)
    {
        if (command is null)
            return BadRequest("El payload de liberación es obligatorio.");

        if (string.IsNullOrWhiteSpace(command.Cocina) || string.IsNullOrWhiteSpace(command.Turno))
            return BadRequest("La cocina y el turno son campos obligatorios.");

        var id = await Mediator.Send(command, ct);
        return Created(string.Empty, new { id });
    }
}
