using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SistemaRecepcionMP.Application.Features.Calidad.Commands.RegistrarLavadoBotasManos;
using SistemaRecepcionMP.Application.Features.Calidad.Commands.RegistrarVerificacionInstalacion;
using SistemaRecepcionMP.Application.Features.Calidad.Commands.RegistrarLiberacionCocina;
using SistemaRecepcionMP.Application.Features.Calidad.DTOs;
using SistemaRecepcionMP.API.Models;
using SistemaRecepcionMP.Infraestructure.Persistence;
using System.Text.Json;

namespace SistemaRecepcionMP.API.Controllers;

public sealed class CalidadController : BaseController
{
    [HttpGet("stats")]
    [Authorize]
    [ProducesResponseType(typeof(DashboardCalidadDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<DashboardCalidadDto>> GetDashboardStats(CancellationToken ct = default)
    {
        // ── Rango del día de hoy ─────────────────────────────────────────────
        var inicioHoy = DateTime.Today;
        var finHoy = inicioHoy.AddDays(1);

        var scopeFactory = HttpContext.RequestServices.GetRequiredService<IServiceScopeFactory>();

        // ── Métricas por tabla (en paralelo) ────────────────────────────────

        async Task<int> CountLiberacionesAsync()
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            return await db.LiberacionesCocinas
                .Where(x => x.Fecha >= inicioHoy && x.Fecha < finHoy)
                .CountAsync(ct);
        }

        async Task<int> CountLiberacionesCriticasAsync()
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            return await db.LiberacionesCocinas
                .Where(x => x.Fecha >= inicioHoy && x.Fecha < finHoy)
                .Where(x => x.Detalles.Any(d => d.Estado.ToLower() == "no cumple"))
                .CountAsync(ct);
        }

        async Task<int> CountLavadosAsync()
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            return await db.LavadosBotasManos
                .Where(x => x.Fecha >= inicioHoy && x.Fecha < finHoy)
                .CountAsync(ct);
        }

        async Task<int> CountLavadosCriticosAsync()
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Como LavadoBotasManos no tiene detalle por ítem,
            // usamos palabras clave en Novedades/Observaciones como "estado de falla".
            return await db.LavadosBotasManos
                .Where(x => x.Fecha >= inicioHoy && x.Fecha < finHoy)
                .Where(x =>
                    (x.Novedades != null && (
                        x.Novedades.ToLower().Contains("no cumple") ||
                        x.Novedades.ToLower().Contains("falla") ||
                        x.Novedades.ToLower().Contains("incumpl")))
                    ||
                    (x.Observaciones != null && (
                        x.Observaciones.ToLower().Contains("no cumple") ||
                        x.Observaciones.ToLower().Contains("falla") ||
                        x.Observaciones.ToLower().Contains("incumpl"))))
                .CountAsync(ct);
        }

        async Task<int> CountVerificacionesAsync()
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            return await db.VerificacionesInstalaciones
                .Where(x => x.Fecha >= inicioHoy && x.Fecha < finHoy)
                .CountAsync(ct);
        }

        async Task<int> CountVerificacionesCriticasAsync()
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            return await db.VerificacionesInstalaciones
                .Where(x => x.Fecha >= inicioHoy && x.Fecha < finHoy)
                // Calificacion == 1 => "No cumple" (según UI/validator 1|2)
                .Where(x => x.Detalles.Any(d => d.Calificacion == 1))
                .CountAsync(ct);
        }

        async Task<List<NovedadRecienteDto>> GetHistorialLiberacionesAsync()
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            return await db.LiberacionesCocinas
                .OrderByDescending(x => x.Fecha)
                .Take(5)
                .AsNoTracking()
                .Select(x => new NovedadRecienteDto
                {
                    Titulo = x.Cocina,
                    Fecha = x.Fecha,
                    Responsable = x.NombreResponsable,
                    TipoFormulario = "Liberación"
                })
                .ToListAsync(ct);
        }

        async Task<List<NovedadRecienteDto>> GetHistorialLavadosAsync()
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            return await db.LavadosBotasManos
                .OrderByDescending(x => x.Fecha)
                .Take(5)
                .AsNoTracking()
                .Select(x => new NovedadRecienteDto
                {
                    Titulo = x.Turno,
                    Fecha = x.Fecha,
                    Responsable = x.NombreResponsable,
                    TipoFormulario = "Lavado de Botas y Manos"
                })
                .ToListAsync(ct);
        }

        async Task<List<NovedadRecienteDto>> GetHistorialVerificacionesAsync()
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            return await db.VerificacionesInstalaciones
                .OrderByDescending(x => x.Fecha)
                .Take(5)
                .AsNoTracking()
                .Select(x => new NovedadRecienteDto
                {
                    Titulo = x.Zona,
                    Fecha = x.Fecha,
                    Responsable = x.Usuario.Nombre,
                    TipoFormulario = "Verificación de Instalaciones"
                })
                .ToListAsync(ct);
        }

        var inspeccionesLiberacionTask = CountLiberacionesAsync();
        var inspeccionesLiberacionCriticasTask = CountLiberacionesCriticasAsync();

        var inspeccionesLavadoTask = CountLavadosAsync();
        var inspeccionesLavadoCriticasTask = CountLavadosCriticosAsync();

        var inspeccionesVerificacionTask = CountVerificacionesAsync();
        var inspeccionesVerificacionCriticasTask = CountVerificacionesCriticasAsync();

        var historialLiberacionesTask = GetHistorialLiberacionesAsync();
        var historialLavadosTask = GetHistorialLavadosAsync();
        var historialVerificacionesTask = GetHistorialVerificacionesAsync();

        await Task.WhenAll(
            inspeccionesLiberacionTask,
            inspeccionesLiberacionCriticasTask,
            inspeccionesLavadoTask,
            inspeccionesLavadoCriticasTask,
            inspeccionesVerificacionTask,
            inspeccionesVerificacionCriticasTask,
            historialLiberacionesTask,
            historialLavadosTask,
            historialVerificacionesTask);

        var inspeccionesHoy =
            inspeccionesLiberacionTask.Result +
            inspeccionesLavadoTask.Result +
            inspeccionesVerificacionTask.Result;

        var alertasCriticas =
            inspeccionesLiberacionCriticasTask.Result +
            inspeccionesLavadoCriticasTask.Result +
            inspeccionesVerificacionCriticasTask.Result;

        // PorcentajeCumplimiento = (Exitosas / Total) * 100
        var exitosas = Math.Max(0, inspeccionesHoy - alertasCriticas);
        var porcentajeCumplimiento = inspeccionesHoy == 0
            ? 0m
            : (exitosas * 100m) / inspeccionesHoy;

        // "Turnos Pendientes": número de procesos (Liberación, Lavado, Verificación)
        // para los que aún no hay registros de inspección en el día.
        var turnosPendientes =
            3 - (
                (inspeccionesLiberacionTask.Result > 0 ? 1 : 0) +
                (inspeccionesLavadoTask.Result > 0 ? 1 : 0) +
                (inspeccionesVerificacionTask.Result > 0 ? 1 : 0)
            );

        var historial = historialLiberacionesTask.Result
            .Concat(historialLavadosTask.Result)
            .Concat(historialVerificacionesTask.Result)
            .OrderByDescending(x => x.Fecha)
            .Take(5)
            .ToList();

        var dto = new DashboardCalidadDto
        {
            InspeccionesHoy = inspeccionesHoy,
            PorcentajeCumplimiento = porcentajeCumplimiento,
            AlertasCriticas = alertasCriticas,
            TurnosPendientes = turnosPendientes,
            HistorialNovedades = historial
        };

        return Ok(dto);
    }

    [HttpGet("liberacion-cocinas")]
    [ProducesResponseType(typeof(List<LiberacionCocinaHistorialItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<LiberacionCocinaHistorialItemDto>>> GetLiberacionesCocinas(
        CancellationToken ct = default)
    {
        var db = HttpContext.RequestServices.GetRequiredService<ApplicationDbContext>();

        var items = await db.LiberacionesCocinas
            .AsNoTracking()
            .OrderByDescending(x => x.Fecha)
            .Select(x => new LiberacionCocinaHistorialItemDto
            {
                Id = x.Id,
                Fecha = x.Fecha,
                Cocina = x.Cocina,
                NombreResponsable = x.NombreResponsable,
                TieneFallas = x.Detalles.Any(d => d.Estado.ToLower() == "no cumple"),
            })
            .ToListAsync(ct);

        return Ok(items);
    }

    [HttpGet("liberacion-cocinas/{id:int}")]
    [ProducesResponseType(typeof(LiberacionCocinaDetalleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LiberacionCocinaDetalleDto>> GetLiberacionCocinaById(
        int id,
        CancellationToken ct = default)
    {
        var db = HttpContext.RequestServices.GetRequiredService<ApplicationDbContext>();

        var dto = await db.LiberacionesCocinas
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new LiberacionCocinaDetalleDto
            {
                Id = x.Id,
                Fecha = x.Fecha,
                Turno = x.Turno,
                Cocina = x.Cocina,
                NombreResponsable = x.NombreResponsable,
                CargoResponsable = x.CargoResponsable,
                ObservacionesInspeccion = x.ObservacionesInspeccion,
                ObservacionesGenerales = x.ObservacionesGenerales,
                Detalles = x.Detalles
                    .Select(d => new LiberacionCocinaDetalleInspeccionDto
                    {
                        Item = d.Item,
                        Estado = d.Estado,
                    })
                    .ToList(),
            })
            .FirstOrDefaultAsync(ct);

        if (dto is null)
            return NotFound();

        return Ok(dto);
    }

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

    [HttpPost("liberacion-cocinas")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegistrarLiberacionCocina(
        [FromBody] RegistrarLiberacionCocinaCommand command,
        CancellationToken ct = default)
    {
        // Al ser un JSON directo ([FromBody]), no necesitamos deserializar manualmente
        if (command is null)
            return BadRequest("El payload de liberación es obligatorio.");

        if (string.IsNullOrWhiteSpace(command.Cocina) || string.IsNullOrWhiteSpace(command.Turno))
            return BadRequest("La cocina y el turno son campos obligatorios.");

        var id = await Mediator.Send(command, ct);

        return Created(string.Empty, new { id });
    }
}
