using SistemaRecepcionMP.Application.Features.Recepciones.Commands.AdjuntarDocumento;
using SistemaRecepcionMP.Application.Features.Recepciones.Commands.IniciarRecepcion;
using SistemaRecepcionMP.Application.Features.Recepciones.Commands.RegistrarInspeccionVehiculo;
using SistemaRecepcionMP.Application.Features.Recepciones.Commands;
using SistemaRecepcionMP.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using SistemaRecepcionMP.Application.Features.Recepciones.Queries;
using SistemaRecepcionMP.API.Models;
using SistemaRecepcionMP.Application.Features.Recepciones.Commands.AgregarItemRecepcion;
using SistemaRecepcionMP.Application.Features.Recepciones.Commands.FinalizarRecepcion;
using SistemaRecepcionMP.Application.Features.Recepciones.Commands.RegistrarLotes;
using SistemaRecepcionMP.Application.Common.Exceptions;

namespace SistemaRecepcionMP.API.Controllers;

public sealed class RecepcionesController : BaseController
{
    // ── Queries ───────────────────────────────────────────────────────────────

    /// <summary>
    /// Lista recepciones con filtros opcionales por estado, proveedor y rango de fechas.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] EstadoRecepcion? estado = null,
        [FromQuery] Guid? proveedorId = null,
        [FromQuery] DateOnly? fechaDesde = null,
        [FromQuery] DateOnly? fechaHasta = null,
        CancellationToken ct = default)
    {

        // 🔥 VALIDACIÓN
        if (!CurrentUser.TienePerfil(PerfilUsuario.RecepcionAlmacen))
            throw new ForbiddenAccessException(PerfilUsuario.RecepcionAlmacen, CurrentUser.Perfil);

        var result = await Mediator.Send(new GetRecepcionesQuery
        {
            Estado = estado,
            ProveedorId = proveedorId,
            FechaDesde = fechaDesde,
            FechaHasta = fechaHasta
        }, ct);
        return Ok(result);
    }

    /// <summary>
    /// Obtiene el detalle completo de una recepción incluyendo
    /// lotes, documentos, inspección de vehículo y registros de temperatura.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetRecepcionByIdQuery(id), ct);
        return Ok(result);
    }

    // ── Commands ──────────────────────────────────────────────────────────────

    /// <summary>
    /// Paso 1 — Inicia el proceso de recepción asociado a una OC.
    /// Verifica que el proveedor tenga documentos sanitarios vigentes.
    /// Devuelve el ID de la recepción creada en estado Borrador.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> Iniciar(
        [FromBody] IniciarRecepcionCommand command,
        CancellationToken ct = default)
    {
        var id = await Mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    /// <summary>
    /// Paso 2 — Registra la inspección del vehículo.
    /// Si hay fallas críticas (plagas, temperatura fuera de rango), la recepción pasa a Rechazada.
    /// Si todo está bien, pasa a EnInspeccion y se pueden registrar lotes.
    /// </summary>
    [HttpPost("{id:guid}/inspeccion-vehiculo")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> RegistrarInspeccionVehiculo(
        Guid id,
        [FromBody] RegistrarInspeccionVehiculoCommand command,
        CancellationToken ct = default)
    {
        command.RecepcionId = id;
        await Mediator.Send(command, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/items")]
    public async Task<IActionResult> AgregarItem(
        Guid id,
        [FromBody] AgregarItemRecepcionCommand command,
        CancellationToken ct = default)
    {
        command.RecepcionId = id;
        var itemId = await Mediator.Send(command, ct);
        return Created(string.Empty, new { id = itemId });
    }

    /// <summary>
    /// Registra una temperatura a nivel de recepción (antes de descargar).
    /// Para temperaturas por lote específico usar POST /api/lotes/{id}/temperaturas.
    /// </summary>
    [HttpPost("{id:guid}/temperaturas")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegistrarTemperatura(
        Guid id,
        [FromBody] RegistrarTemperaturaCommand command,
        CancellationToken ct = default)
    {
        command.RecepcionId = id;
        command.LoteRecibidoId = null;
        var registroId = await Mediator.Send(command, ct);
        return Created(string.Empty, new { id = registroId });
    }

    /// <summary>
    /// Adjunta un documento a la recepción (factura, remisión, etc.).
    /// Para documentos de lotes específicos usar POST /api/lotes/{id}/documentos.
    /// </summary>
    [HttpPost("{id:guid}/documentos")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AdjuntarDocumento(
        Guid id,
        [FromForm] AdjuntarDocumentoRecepcionRequest request,
        CancellationToken ct = default)
    {
        using var ms = new MemoryStream();
        await request.Archivo.CopyToAsync(ms, ct);

        var command = new AdjuntarDocumentoCommand
        {
            RecepcionId = id,
            LoteRecibidoId = null,
            TipoDocumento = request.TipoDocumento,
            NombreArchivo = request.Archivo.FileName,
            ContenidoArchivo = ms.ToArray()
        };

        var documentoId = await Mediator.Send(command, ct);
        return Created(string.Empty, new { id = documentoId });
    }

    [HttpPost("{id:guid}/finalizar")]
    public async Task<IActionResult> Finalizar(
        Guid id,
        CancellationToken ct = default)
    {
        await Mediator.Send(new FinalizarRecepcionCommand
        {
            RecepcionId = id
        }, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/registrar-lotes-completo")] // <--- Añadimos el {id:guid}
    public async Task<ActionResult<bool>> RegistrarLotes(Guid id, [FromBody] RegistrarLotesCommand command)
    {
        // Aseguramos que el ID de la URL sea el mismo del comando
        if (id != command.RecepcionId) return BadRequest("El ID de recepción no coincide.");
    
        var result = await Mediator.Send(command);
        return Ok(result);
    }

}