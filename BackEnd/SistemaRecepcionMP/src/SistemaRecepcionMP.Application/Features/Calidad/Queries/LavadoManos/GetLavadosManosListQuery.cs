using MediatR;
using SistemaRecepcionMP.Application.Features.Calidad.DTOs;

namespace SistemaRecepcionMP.Application.Features.Calidad.Queries.LavadoManos;

public sealed class GetLavadosManosListQuery
    : IRequest<IReadOnlyList<LavadoManosListItemDto>> { }
