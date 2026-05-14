using MediatR;
using SistemaRecepcionMP.Application.Features.Calidad.DTOs;

namespace SistemaRecepcionMP.Application.Features.Calidad.Queries.LiberacionCocina;

public sealed class GetLiberacionCocinaByIdQuery : IRequest<LiberacionCocinaDetalleDto?>
{
    public int Id { get; }

    public GetLiberacionCocinaByIdQuery(int id) => Id = id;
}
