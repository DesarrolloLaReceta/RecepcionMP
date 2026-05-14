using MediatR;
using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Application.Features.Calidad.DTOs;

namespace SistemaRecepcionMP.Application.Features.Calidad.Queries.VerificacionInstalaciones;

public sealed class GetVerificacionesInstalacionesListQueryHandler
    : IRequestHandler<GetVerificacionesInstalacionesListQuery, IReadOnlyList<VerificacionInstalacionListItemDto>>
{
    private readonly ICalidadQueryService _calidadQueries;

    public GetVerificacionesInstalacionesListQueryHandler(ICalidadQueryService calidadQueries)
    {
        _calidadQueries = calidadQueries;
    }

    public Task<IReadOnlyList<VerificacionInstalacionListItemDto>> Handle(
        GetVerificacionesInstalacionesListQuery request,
        CancellationToken cancellationToken)
        => _calidadQueries.GetVerificacionesInstalacionesListAsync(cancellationToken);
}
