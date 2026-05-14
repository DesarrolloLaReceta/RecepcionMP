using Microsoft.AspNetCore.Mvc;
using SistemaRecepcionMP.Application.Features.Calidad.Commands.RegistrarVerificacionInstalacion;
using SistemaRecepcionMP.Application.Features.Calidad.DTOs;
using SistemaRecepcionMP.Application.Features.Calidad.Queries.VerificacionInstalaciones;
using SistemaRecepcionMP.API.Models;
using System.Text.Json;

namespace SistemaRecepcionMP.API.Controllers;

public sealed class VerificacionInstalacionesController : BaseController
{
    [HttpGet]
    [ProducesResponseType(typeof(List<VerificacionInstalacionListItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<VerificacionInstalacionListItemDto>>> GetList(CancellationToken ct = default)
    {
        var items = await Mediator.Send(new GetVerificacionesInstalacionesListQuery(), ct);
        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(VerificacionInstalacionDetalleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VerificacionInstalacionDetalleDto>> GetById(Guid id, CancellationToken ct = default)
    {
        var dto = await Mediator.Send(new GetVerificacionInstalacionByIdQuery(id), ct);
        if (dto is null)
            return NotFound();
        return Ok(dto);
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Guardar(
        [FromForm] GuardarVerificacionInstalacionesRequest request,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.DataJson))
            return BadRequest("La información de verificación es obligatoria.");

        VerificacionInstalacionPayloadDto? payload;
        try
        {
            payload = JsonSerializer.Deserialize<VerificacionInstalacionPayloadDto>(
                request.DataJson,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
        catch (JsonException)
        {
            return BadRequest("Formato de dataJson inválido.");
        }

        if (payload is null)
            return BadRequest("No se pudo leer el payload de verificación.");

        if (payload.PeriodoMes is < 1 or > 12 || payload.PeriodoAnio is < 2000 or > 2100)
            return BadRequest("PeriodoAnio y PeriodoMes deben indicar un mes válido.");

        var fechaPeriodo = new DateTime(payload.PeriodoAnio, payload.PeriodoMes, 1, 0, 0, 0, DateTimeKind.Unspecified);

        var nombreResp = !string.IsNullOrWhiteSpace(request.NombreResponsable)
            ? request.NombreResponsable.Trim()
            : (payload.NombreResponsable ?? string.Empty).Trim();
        var cargoResp = !string.IsNullOrWhiteSpace(request.CargoResponsable)
            ? request.CargoResponsable.Trim()
            : (payload.CargoResponsable ?? string.Empty).Trim();

        var command = new RegistrarVerificacionInstalacionCommand
        {
            Zona = payload.Zona,
            FechaPeriodo = fechaPeriodo,
            CumplimientoTotal = payload.CumplimientoTotal,
            ObservacionesGenerales = !string.IsNullOrWhiteSpace(request.ObservacionesGenerales)
                ? request.ObservacionesGenerales.Trim()
                : payload.ObservacionesGenerales,
            NombreResponsable = nombreResp,
            CargoResponsable = cargoResp,
            Detalles = payload.Secciones
                .SelectMany(s => s.Filas)
                .Select(f => new RegistrarVerificacionInstalacionDetalleDto
                {
                    AspectoId = f.AspectoId,
                    AspectoNombre = f.Item,
                    Calificacion = f.Calificacion,
                    Hallazgo = f.Hallazgos,
                    PlanAccion = f.PlanAccion,
                    Responsable = f.Responsable,
                    Fotos = new List<RegistrarVerificacionInstalacionFotoDto>()
                })
                .ToList()
        };

        foreach (var formFile in Request.Form.Files)
        {
            if (formFile.Length <= 0) continue;
            const string prefix = "Fotos__";
            if (!formFile.Name.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)) continue;
            var aspectoId = formFile.Name[prefix.Length..];
            var detalle = command.Detalles.FirstOrDefault(d => d.AspectoId == aspectoId);
            if (detalle is null) continue;

            await using var ms = new MemoryStream();
            await formFile.CopyToAsync(ms, ct);
            detalle.Fotos.Add(new RegistrarVerificacionInstalacionFotoDto
            {
                NombreArchivo = formFile.FileName,
                Contenido = ms.ToArray(),
                TipoContenido = formFile.ContentType
            });
        }

        var id = await Mediator.Send(command, ct);
        return Created(string.Empty, new { id });
    }
}
