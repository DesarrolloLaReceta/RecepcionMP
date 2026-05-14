using MediatR;
using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Application.Features.Calidad.DTOs;

namespace SistemaRecepcionMP.Application.Features.Calidad.Queries.VerificacionInstalaciones;

public sealed class GetVerificacionInstalacionByIdQueryHandler
    : IRequestHandler<GetVerificacionInstalacionByIdQuery, VerificacionInstalacionDetalleDto?>
{
    private readonly ICalidadQueryService _calidadQueries;

    public GetVerificacionInstalacionByIdQueryHandler(ICalidadQueryService calidadQueries)
    {
        _calidadQueries = calidadQueries;
    }

    public Task<VerificacionInstalacionDetalleDto?> Handle(
        GetVerificacionInstalacionByIdQuery request,
        CancellationToken cancellationToken)
        => _calidadQueries.GetVerificacionInstalacionByIdAsync(request.Id, cancellationToken);
}
