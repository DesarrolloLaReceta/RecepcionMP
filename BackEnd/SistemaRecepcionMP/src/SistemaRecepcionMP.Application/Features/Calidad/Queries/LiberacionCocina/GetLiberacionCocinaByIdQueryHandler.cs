using MediatR;
using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Application.Features.Calidad.DTOs;

namespace SistemaRecepcionMP.Application.Features.Calidad.Queries.LiberacionCocina;

public sealed class GetLiberacionCocinaByIdQueryHandler
    : IRequestHandler<GetLiberacionCocinaByIdQuery, LiberacionCocinaDetalleDto?>
{
    private readonly ICalidadQueryService _calidadQueries;

    public GetLiberacionCocinaByIdQueryHandler(ICalidadQueryService calidadQueries)
    {
        _calidadQueries = calidadQueries;
    }

    public Task<LiberacionCocinaDetalleDto?> Handle(
        GetLiberacionCocinaByIdQuery request,
        CancellationToken cancellationToken)
        => _calidadQueries.GetLiberacionCocinaByIdAsync(request.Id, cancellationToken);
}
