using MediatR;
using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Application.Features.Calidad.DTOs;

namespace SistemaRecepcionMP.Application.Features.Calidad.Queries.LavadoManos;

public sealed class GetLavadoManosByIdQueryHandler
    : IRequestHandler<GetLavadoManosByIdQuery, LavadoManosDetalleDto?>
{
    private readonly ICalidadQueryService _calidadQueries;

    public GetLavadoManosByIdQueryHandler(ICalidadQueryService calidadQueries)
    {
        _calidadQueries = calidadQueries;
    }

    public Task<LavadoManosDetalleDto?> Handle(
        GetLavadoManosByIdQuery request,
        CancellationToken cancellationToken)
        => _calidadQueries.GetLavadoManosByIdAsync(request.Id, cancellationToken);
}
