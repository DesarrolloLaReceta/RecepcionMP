using Microsoft.AspNetCore.Mvc;
using SistemaRecepcionMP.Application.Features.Calidad.DTOs;
using SistemaRecepcionMP.Application.Features.Calidad.Queries.GetCalidadDashboardStats;

namespace SistemaRecepcionMP.API.Controllers;

public sealed class CalidadDashboardController : BaseController
{
    [HttpGet("stats")]
    [ProducesResponseType(typeof(DashboardCalidadDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<DashboardCalidadDto>> GetStats(CancellationToken ct = default)
    {
        var dto = await Mediator.Send(new GetCalidadDashboardStatsQuery(), ct);
        return Ok(dto);
    }
}
