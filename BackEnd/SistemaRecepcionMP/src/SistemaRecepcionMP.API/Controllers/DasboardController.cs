using SistemaRecepcionMP.Application.Features.Dashboard;
using Microsoft.AspNetCore.Mvc;

namespace SistemaRecepcionMP.API.Controllers;

public sealed class DashboardController : BaseController
{
    /// <summary>
    /// KPIs principales del período.
    /// Si no se indica mes, devuelve el año completo.
    /// Incluye: recepciones, lotes, no conformidades y acciones vencidas.
    /// </summary>
    [HttpGet("kpis")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetKpis(
        [FromQuery] int? año = null,
        [FromQuery] int? mes = null,
        CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetKpiRecepcionesQuery
        {
            Año = año ?? DateTime.UtcNow.Year,
            Mes = mes
        }, ct);
        return Ok(result);
    }

    /// <summary>
    /// Lotes próximos a vencer según umbral de días.
    /// Por defecto alerta con 30 días de anticipación.
    /// Incluye los ya vencidos por defecto — útil para gestión de inventario.
    /// </summary>
    [HttpGet("vencimientos")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetVencimientos(
        [FromQuery] int diasUmbral = 30,
        [FromQuery] bool incluirVencidos = true,
        CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetVencimientosProximosQuery
        {
            DiasUmbral = diasUmbral,
            IncluirVencidos = incluirVencidos
        }, ct);
        return Ok(result);
    }

    /// <summary>
    /// Documentos sanitarios de proveedores próximos a vencer.
    /// Por defecto alerta con 30 días de anticipación.
    /// </summary>
    [HttpGet("documentos-por-vencer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDocumentosPorVencer(
        [FromQuery] int diasUmbral = 30,
        CancellationToken ct = default)
    {
        var result = await Mediator.Send(
            new GetDocumentosPorVencerDashboardQuery { DiasUmbral = diasUmbral }, ct);
        return Ok(result);
    }

    /// <summary>
    /// Registros de temperatura fuera de rango.
    /// Por defecto devuelve las últimas 24 horas — puede ajustarse.
    /// Puede filtrarse por recepción específica.
    /// </summary>
    [HttpGet("temperaturas-fuera-rango")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTemperaturasFueraDeRango(
        [FromQuery] int ultimasHoras = 24,
        [FromQuery] Guid? recepcionId = null,
        CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetTemperaturasFueraDeRangoQuery
        {
            UltimasHoras = ultimasHoras,
            RecepcionId = recepcionId
        }, ct);
        return Ok(result);
    }
}