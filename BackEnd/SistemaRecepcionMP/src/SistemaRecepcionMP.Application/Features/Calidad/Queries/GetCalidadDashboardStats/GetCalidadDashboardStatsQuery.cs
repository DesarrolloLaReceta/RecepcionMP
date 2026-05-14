using MediatR;
using SistemaRecepcionMP.Application.Features.Calidad.DTOs;

namespace SistemaRecepcionMP.Application.Features.Calidad.Queries.GetCalidadDashboardStats;

public sealed class GetCalidadDashboardStatsQuery : IRequest<DashboardCalidadDto> { }
