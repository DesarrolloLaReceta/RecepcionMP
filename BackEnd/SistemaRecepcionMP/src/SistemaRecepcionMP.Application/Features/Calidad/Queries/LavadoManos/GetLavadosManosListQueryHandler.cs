using MediatR;
using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Application.Features.Calidad.DTOs;

namespace SistemaRecepcionMP.Application.Features.Calidad.Queries.LavadoManos;

public sealed class GetLavadosManosListQueryHandler
    : IRequestHandler<GetLavadosManosListQuery, IReadOnlyList<LavadoManosListItemDto>>
{
    private readonly ICalidadQueryService _calidadQueries;

    public GetLavadosManosListQueryHandler(ICalidadQueryService calidadQueries)
    {
        _calidadQueries = calidadQueries;
    }

    public Task<IReadOnlyList<LavadoManosListItemDto>> Handle(
        GetLavadosManosListQuery request,
        CancellationToken cancellationToken)
        => _calidadQueries.GetLavadosManosListAsync(cancellationToken);
}
