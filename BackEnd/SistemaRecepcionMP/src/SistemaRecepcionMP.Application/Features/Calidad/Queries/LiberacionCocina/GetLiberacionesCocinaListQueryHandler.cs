using MediatR;
using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Application.Features.Calidad.DTOs;

namespace SistemaRecepcionMP.Application.Features.Calidad.Queries.LiberacionCocina;

public sealed class GetLiberacionesCocinaListQueryHandler
    : IRequestHandler<GetLiberacionesCocinaListQuery, IReadOnlyList<LiberacionCocinaHistorialItemDto>>
{
    private readonly ICalidadQueryService _calidadQueries;

    public GetLiberacionesCocinaListQueryHandler(ICalidadQueryService calidadQueries)
    {
        _calidadQueries = calidadQueries;
    }

    public Task<IReadOnlyList<LiberacionCocinaHistorialItemDto>> Handle(
        GetLiberacionesCocinaListQuery request,
        CancellationToken cancellationToken)
        => _calidadQueries.GetLiberacionesCocinaListAsync(cancellationToken);
}
