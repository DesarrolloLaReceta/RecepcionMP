using MediatR;
using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Application.Features.Calidad.DTOs;

namespace SistemaRecepcionMP.Application.Features.Calidad.Queries.GetCalidadDashboardStats;

public sealed class GetCalidadDashboardStatsQueryHandler
    : IRequestHandler<GetCalidadDashboardStatsQuery, DashboardCalidadDto>
{
    private readonly ICalidadQueryService _calidadQueries;

    public GetCalidadDashboardStatsQueryHandler(ICalidadQueryService calidadQueries)
    {
        _calidadQueries = calidadQueries;
    }

    public Task<DashboardCalidadDto> Handle(
        GetCalidadDashboardStatsQuery request,
        CancellationToken cancellationToken)
        => _calidadQueries.GetDashboardStatsAsync(cancellationToken);
}
