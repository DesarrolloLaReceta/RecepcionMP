using MediatR;
using SistemaRecepcionMP.Application.Features.Calidad.DTOs;

namespace SistemaRecepcionMP.Application.Features.Calidad.Queries.LiberacionCocina;

public sealed class GetLiberacionesCocinaListQuery
    : IRequest<IReadOnlyList<LiberacionCocinaHistorialItemDto>> { }
