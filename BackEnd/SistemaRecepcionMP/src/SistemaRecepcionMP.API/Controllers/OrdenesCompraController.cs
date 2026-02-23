using SistemaRecepcionMP.Application.Features.OrdenesCompra.Commands.ActualizarEstadoOC;
using SistemaRecepcionMP.Application.Features.OrdenesCompra.Commands.CrearOrdenCompra;
using SistemaRecepcionMP.Application.Features.OrdenesCompra.Queries;
using SistemaRecepcionMP.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace SistemaRecepcionMP.API.Controllers;

public sealed class OrdenesCompraController : BaseController
{
    // ── Queries ───────────────────────────────────────────────────────────────

    /// <summary>
    /// Lista órdenes de compra abiertas y parcialmente recibidas.
    /// Puede filtrarse por proveedor — útil al iniciar una recepción.
    /// </summary>
    [HttpGet("abiertas")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAbiertas(
        [FromQuery] Guid? proveedorId = null,
        CancellationToken ct = default)
    {
        var result = await Mediator.Send(
            new GetOrdenesAbiertasQuery { ProveedorId = proveedorId }, ct);
        return Ok(result);
    }

    /// <summary>Obtiene una orden de compra con sus detalles de ítems.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetOrdenCompraByIdQuery(id), ct);
        return Ok(result);
    }

    /// <summary>Lista todas las órdenes de compra de un proveedor, con filtro opcional de estado.</summary>
    [HttpGet("por-proveedor/{proveedorId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByProveedor(
        Guid proveedorId,
        [FromQuery] EstadoOrdenCompra? estado = null,
        CancellationToken ct = default)
    {
        var result = await Mediator.Send(
            new GetOCByProveedorQuery(proveedorId, estado), ct);
        return Ok(result);
    }

    // ── Commands ──────────────────────────────────────────────────────────────

    /// <summary>Crea una nueva orden de compra con uno o más ítems.</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Crear(
        [FromBody] CrearOrdenCompraCommand command,
        CancellationToken ct = default)
    {
        var id = await Mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    /// <summary>
    /// Actualiza el estado de una OC.
    /// Transiciones válidas: Abierta → Cancelada, ParcialmenteRecibida → Cancelada.
    /// </summary>
    [HttpPatch("{id:guid}/estado")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ActualizarEstado(
        Guid id,
        [FromBody] ActualizarEstadoOCCommand command,
        CancellationToken ct = default)
    {
        command.Id = id;
        await Mediator.Send(command, ct);
        return NoContent();
    }
}