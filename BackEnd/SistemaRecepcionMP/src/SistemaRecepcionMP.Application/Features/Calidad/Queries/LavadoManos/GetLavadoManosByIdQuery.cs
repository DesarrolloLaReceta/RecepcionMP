using MediatR;
using SistemaRecepcionMP.Application.Features.Calidad.DTOs;

namespace SistemaRecepcionMP.Application.Features.Calidad.Queries.LavadoManos;

public sealed class GetLavadoManosByIdQuery : IRequest<LavadoManosDetalleDto?>
{
    public Guid Id { get; }

    public GetLavadoManosByIdQuery(Guid id) => Id = id;
}
