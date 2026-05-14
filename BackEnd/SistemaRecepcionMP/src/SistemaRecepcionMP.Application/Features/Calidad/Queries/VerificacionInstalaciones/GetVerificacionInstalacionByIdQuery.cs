using MediatR;
using SistemaRecepcionMP.Application.Features.Calidad.DTOs;

namespace SistemaRecepcionMP.Application.Features.Calidad.Queries.VerificacionInstalaciones;

public sealed class GetVerificacionInstalacionByIdQuery : IRequest<VerificacionInstalacionDetalleDto?>
{
    public Guid Id { get; }

    public GetVerificacionInstalacionByIdQuery(Guid id) => Id = id;
}
