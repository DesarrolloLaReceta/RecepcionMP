using Microsoft.AspNetCore.Mvc;
using SistemaRecepcionMP.Application.Features.Calidad.Commands.RegistrarLavadoBotasManos;
using SistemaRecepcionMP.Application.Features.Calidad.Commands.RegistrarVerificacionInstalacion;
using SistemaRecepcionMP.API.Models;
using System.Text.Json;

namespace SistemaRecepcionMP.API.Controllers;

public sealed class CalidadController : BaseController
{
    [HttpPost("verificacion-instalaciones")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GuardarVerificacionInstalaciones(
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

        var command = new RegistrarVerificacionInstalacionCommand
        {
            Zona = payload.Zona,
            CumplimientoTotal = payload.CumplimientoTotal,
            ObservacionesGenerales = payload.ObservacionesGenerales,
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

    [HttpPost("lavado-botas-manos")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegistrarLavadoBotasManos(
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
            Observaciones = request.Observaciones
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
