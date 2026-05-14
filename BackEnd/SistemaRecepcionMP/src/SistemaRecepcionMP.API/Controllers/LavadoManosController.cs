using Microsoft.AspNetCore.Mvc;
using SistemaRecepcionMP.Application.Features.Calidad.Commands.RegistrarLavadoBotasManos;
using SistemaRecepcionMP.Application.Features.Calidad.DTOs;
using SistemaRecepcionMP.Application.Features.Calidad.Queries.LavadoManos;
using SistemaRecepcionMP.API.Models;

namespace SistemaRecepcionMP.API.Controllers;

public sealed class LavadoManosController : BaseController
{
    [HttpGet]
    [ProducesResponseType(typeof(List<LavadoManosListItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<LavadoManosListItemDto>>> GetList(CancellationToken ct = default)
    {
        var items = await Mediator.Send(new GetLavadosManosListQuery(), ct);
        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(LavadoManosDetalleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LavadoManosDetalleDto>> GetById(Guid id, CancellationToken ct = default)
    {
        var dto = await Mediator.Send(new GetLavadoManosByIdQuery(id), ct);
        if (dto is null)
            return NotFound();
        return Ok(dto);
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Registrar(
        [FromForm] RegistrarLavadoBotasManosRequest request,
        CancellationToken ct = default)
    {
        var command = new RegistrarLavadoBotasManosCommand
        {
            Fecha = request.Fecha,
            Turno = request.Turno,
            Piso = request.Piso,
            Entrada = request.Entrada,
            PersonasRevisadas = request.PersonasRevisadas,
            Novedades = request.Novedades,
            Observaciones = request.Observaciones,
            NombreResponsable = request.NombreResponsable,
            CargoResponsable = request.CargoResponsable
        };

        if (request.FotoEvidencia is { Length: > 0 })
        {
            await using var ms = new MemoryStream();
            await request.FotoEvidencia.CopyToAsync(ms, ct);
            command.FotoNombreArchivo = request.FotoEvidencia.FileName;
            command.FotoContenido = ms.ToArray();
        }

        var id = await Mediator.Send(command, ct);
        return Created(string.Empty, new { id });
    }
}
