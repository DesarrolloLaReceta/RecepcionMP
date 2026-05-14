using MediatR;
using SistemaRecepcionMP.Application.Features.Calidad.DTOs;

namespace SistemaRecepcionMP.Application.Features.Calidad.Queries.VerificacionInstalaciones;

public sealed class GetVerificacionesInstalacionesListQuery
    : IRequest<IReadOnlyList<VerificacionInstalacionListItemDto>> { }
