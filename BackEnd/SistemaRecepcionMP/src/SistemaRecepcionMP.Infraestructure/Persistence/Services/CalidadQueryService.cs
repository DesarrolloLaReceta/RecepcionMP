using Microsoft.EntityFrameworkCore;
using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Application.Features.Calidad.DTOs;
using SistemaRecepcionMP.Infraestructure.Persistence;

namespace SistemaRecepcionMP.Infraestructure.Persistence.Services;

public sealed class CalidadQueryService : ICalidadQueryService
{
    private readonly ApplicationDbContext _db;
    private readonly ICalidadEvidenciaUrlResolver _fotoUrls;

    public CalidadQueryService(ApplicationDbContext db, ICalidadEvidenciaUrlResolver fotoUrls)
    {
        _db = db;
        _fotoUrls = fotoUrls;
    }

    public async Task<DashboardCalidadDto> GetDashboardStatsAsync(CancellationToken cancellationToken = default)
    {
        var inicioHoy = DateTime.Today;
        var finHoy = inicioHoy.AddDays(1);

        var inspeccionesLiberacion = await _db.LiberacionesCocinas
            .Where(x => x.Fecha >= inicioHoy && x.Fecha < finHoy)
            .CountAsync(cancellationToken);

        var inspeccionesLiberacionCriticas = await _db.LiberacionesCocinas
            .Where(x => x.Fecha >= inicioHoy && x.Fecha < finHoy)
            .Where(x => x.Detalles.Any(d => d.Estado.ToLower() == "no cumple"))
            .CountAsync(cancellationToken);

        var inspeccionesLavado = await _db.LavadosBotasManos
            .Where(x => x.Fecha >= inicioHoy && x.Fecha < finHoy)
            .CountAsync(cancellationToken);

        var inspeccionesLavadoCriticas = await _db.LavadosBotasManos
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
            .CountAsync(cancellationToken);

        var inicioMes = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
        var finMes = inicioMes.AddMonths(1);

        var inspeccionesVerificacion = await _db.VerificacionesInstalaciones
            .Where(x => x.Fecha >= inicioMes && x.Fecha < finMes)
            .CountAsync(cancellationToken);

        var inspeccionesVerificacionCriticas = await _db.VerificacionesInstalaciones
            .Where(x => x.Fecha >= inicioMes && x.Fecha < finMes)
            .Where(x => x.Detalles.Any(d => d.Calificacion == 1))
            .CountAsync(cancellationToken);

        var historialLiberaciones = await _db.LiberacionesCocinas
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
            .ToListAsync(cancellationToken);

        var historialLavados = await _db.LavadosBotasManos
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
            .ToListAsync(cancellationToken);

        var historialVerificaciones = await _db.VerificacionesInstalaciones
            .OrderByDescending(x => x.Fecha)
            .ThenByDescending(x => x.Id)
            .Take(5)
            .AsNoTracking()
            .Select(x => new NovedadRecienteDto
            {
                Titulo = x.Zona,
                Fecha = x.Fecha,
                Responsable = x.NombreResponsable != null && x.NombreResponsable != ""
                    ? x.NombreResponsable
                    : x.Usuario.Nombre,
                TipoFormulario = "Verificación de Instalaciones"
            })
            .ToListAsync(cancellationToken);

        var inspeccionesHoy = inspeccionesLiberacion + inspeccionesLavado + inspeccionesVerificacion;
        var alertasCriticas = inspeccionesLiberacionCriticas + inspeccionesLavadoCriticas + inspeccionesVerificacionCriticas;
        var exitosas = Math.Max(0, inspeccionesHoy - alertasCriticas);
        var porcentajeCumplimiento = inspeccionesHoy == 0
            ? 0m
            : (exitosas * 100m) / inspeccionesHoy;

        var turnosPendientes =
            3 - (
                (inspeccionesLiberacion > 0 ? 1 : 0) +
                (inspeccionesLavado > 0 ? 1 : 0) +
                (inspeccionesVerificacion > 0 ? 1 : 0)
            );

        var historial = historialLiberaciones
            .Concat(historialLavados)
            .Concat(historialVerificaciones)
            .OrderByDescending(x => x.Fecha)
            .Take(5)
            .ToList();

        return new DashboardCalidadDto
        {
            InspeccionesHoy = inspeccionesHoy,
            PorcentajeCumplimiento = porcentajeCumplimiento,
            AlertasCriticas = alertasCriticas,
            TurnosPendientes = turnosPendientes,
            HistorialNovedades = historial
        };
    }

    public async Task<IReadOnlyList<LiberacionCocinaHistorialItemDto>> GetLiberacionesCocinaListAsync(
        CancellationToken cancellationToken = default)
    {
        return await _db.LiberacionesCocinas
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
            .ToListAsync(cancellationToken);
    }

    public async Task<LiberacionCocinaDetalleDto?> GetLiberacionCocinaByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await _db.LiberacionesCocinas
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
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LavadoManosListItemDto>> GetLavadosManosListAsync(
        CancellationToken cancellationToken = default)
    {
        return await _db.LavadosBotasManos
            .AsNoTracking()
            .OrderByDescending(x => x.Fecha)
            .Select(x => new LavadoManosListItemDto
            {
                Id = x.Id,
                Fecha = x.Fecha,
                Turno = x.Turno,
                NombreResponsable = x.NombreResponsable,
                TieneFallas =
                    (x.Novedades != null && (
                        x.Novedades.ToLower().Contains("no cumple") ||
                        x.Novedades.ToLower().Contains("falla") ||
                        x.Novedades.ToLower().Contains("incumpl")))
                    ||
                    (x.Observaciones != null && (
                        x.Observaciones.ToLower().Contains("no cumple") ||
                        x.Observaciones.ToLower().Contains("falla") ||
                        x.Observaciones.ToLower().Contains("incumpl"))),
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<LavadoManosDetalleDto?> GetLavadoManosByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var row = await _db.LavadosBotasManos
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id,
                x.Fecha,
                x.Turno,
                x.Piso,
                x.Entrada,
                x.PersonasRevisadas,
                x.Novedades,
                x.Observaciones,
                x.NombreResponsable,
                x.CargoResponsable,
                x.FotoEvidenciaPath
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (row is null)
            return null;

        return new LavadoManosDetalleDto
        {
            Id = row.Id,
            Fecha = row.Fecha,
            Turno = row.Turno,
            Piso = row.Piso,
            Entrada = row.Entrada,
            PersonasRevisadas = row.PersonasRevisadas,
            Novedades = row.Novedades,
            Observaciones = row.Observaciones,
            NombreResponsable = row.NombreResponsable,
            CargoResponsable = row.CargoResponsable,
            FotoUrl = _fotoUrls.ToPublicFotoUrl(row.FotoEvidenciaPath)
        };
    }

    public async Task<IReadOnlyList<VerificacionInstalacionListItemDto>> GetVerificacionesInstalacionesListAsync(
        CancellationToken cancellationToken = default)
    {
        return await _db.VerificacionesInstalaciones
            .AsNoTracking()
            .OrderByDescending(x => x.Fecha)
            .Select(x => new VerificacionInstalacionListItemDto
            {
                Id = x.Id,
                Fecha = x.Fecha,
                Zona = x.Zona,
                NombreResponsable = x.NombreResponsable != null && x.NombreResponsable != ""
                    ? x.NombreResponsable
                    : x.Usuario.Nombre,
                CargoResponsable = x.CargoResponsable ?? string.Empty,
                CumplimientoTotal = x.CumplimientoTotal,
                TieneFallas = x.Detalles.Any(d => d.Calificacion == 1),
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<VerificacionInstalacionDetalleDto?> GetVerificacionInstalacionByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var cab = await _db.VerificacionesInstalaciones
            .AsNoTracking()
            .Include(x => x.Detalles)
            .Include(x => x.Usuario)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (cab is null)
            return null;

        return new VerificacionInstalacionDetalleDto
        {
            Id = cab.Id,
            Fecha = cab.Fecha,
            Zona = cab.Zona,
            CumplimientoTotal = cab.CumplimientoTotal,
            NombreResponsable = string.IsNullOrWhiteSpace(cab.NombreResponsable)
                ? cab.Usuario.Nombre
                : cab.NombreResponsable,
            CargoResponsable = cab.CargoResponsable ?? string.Empty,
            Detalles = cab.Detalles
                .OrderBy(d => d.AspectoNombre)
                .Select(d => new VerificacionInstalacionDetalleLineaDto
                {
                    AspectoId = d.AspectoId,
                    AspectoNombre = d.AspectoNombre,
                    Calificacion = d.Calificacion,
                    Hallazgo = d.Hallazgo,
                    PlanAccion = d.PlanAccion,
                    Responsable = d.Responsable,
                    FotoUrls = _fotoUrls.ToPublicFotoUrlsFromJson(d.RutasFotos).ToList()
                })
                .ToList()
        };
    }
}
