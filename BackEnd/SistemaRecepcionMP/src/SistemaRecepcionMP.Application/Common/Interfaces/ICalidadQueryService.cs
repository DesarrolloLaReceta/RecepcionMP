using SistemaRecepcionMP.Application.Features.Calidad.DTOs;

namespace SistemaRecepcionMP.Application.Common.Interfaces;

public interface ICalidadQueryService
{
    Task<DashboardCalidadDto> GetDashboardStatsAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<LiberacionCocinaHistorialItemDto>> GetLiberacionesCocinaListAsync(
        CancellationToken cancellationToken = default);

    Task<LiberacionCocinaDetalleDto?> GetLiberacionCocinaByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<LavadoManosListItemDto>> GetLavadosManosListAsync(
        CancellationToken cancellationToken = default);

    Task<LavadoManosDetalleDto?> GetLavadoManosByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<VerificacionInstalacionListItemDto>> GetVerificacionesInstalacionesListAsync(
        CancellationToken cancellationToken = default);

    Task<VerificacionInstalacionDetalleDto?> GetVerificacionInstalacionByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);
}
