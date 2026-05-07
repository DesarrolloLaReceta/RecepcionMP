using SistemaRecepcionMP.Application.Features.Proveedores.Commands.ActualizarProveedor;
using SistemaRecepcionMP.Application.Features.Proveedores.Commands.AgregarDocumentoSanitario;
using SistemaRecepcionMP.Application.Features.Proveedores.Commands.CrearProveedor;
using SistemaRecepcionMP.Application.Features.Proveedores.Commands.EliminarDocumentoSanitario;
using SistemaRecepcionMP.Application.Features.Proveedores.Queries.GetDocumentosPorVencer;
using SistemaRecepcionMP.Application.Features.Proveedores.Queries.GetProveedorById;
using SistemaRecepcionMP.Application.Features.Proveedores.Queries.GetProveedoresList;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SistemaRecepcionMP.API.Models;
using SistemaRecepcionMP.Domain.Constants;

namespace SistemaRecepcionMP.API.Controllers;

public sealed class ProveedoresController : BaseController
{
    // ── Queries ───────────────────────────────────────────────────────────────

    /// <summary>Lista todos los proveedores. Por defecto solo los activos.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] bool soloActivos = true,
        CancellationToken ct = default)
    {
        var result = await Mediator.Send(
            new GetProveedoresListQuery { SoloActivos = soloActivos }, ct);
        return Ok(result);
    }

    /// <summary>Obtiene un proveedor con sus documentos sanitarios y contactos.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetProveedorByIdQuery(id), ct);
        return Ok(result);
    }

    /// <summary>Documentos sanitarios próximos a vencer o ya vencidos.</summary>
    [HttpGet("documentos-por-vencer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDocumentosPorVencer(
        [FromQuery] int diasUmbral = 30,
        CancellationToken ct = default)
    {
        var result = await Mediator.Send(
            new GetDocumentosPorVencerQuery { DiasUmbral = diasUmbral }, ct);
        return Ok(result);
    }

    // ── Commands ──────────────────────────────────────────────────────────────

    /// <summary>Registra un nuevo proveedor en el sistema.</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Crear(
        [FromBody] CrearProveedorCommand command,
        CancellationToken ct = default)
    {
        var id = await Mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    /// <summary>Actualiza los datos de un proveedor existente.</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Actualizar(
        Guid id,
        [FromBody] ActualizarProveedorCommand command,
        CancellationToken ct = default)
    {
        command.Id = id;
        await Mediator.Send(command, ct);
        return NoContent();
    }

    /// <summary>
    /// Adjunta un documento sanitario a un proveedor.
    /// Acepta archivos PDF, JPG o PNG hasta 10 MB.
    /// </summary>
    [HttpPost("{id:guid}/documentos")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AgregarDocumento(
        Guid id,
        [FromForm] AgregarDocumentoSanitarioRequest request,
        CancellationToken ct = default)
    {
        // Convertir IFormFile → byte[] antes de enviar al Command
        using var ms = new MemoryStream();
        await request.Archivo.CopyToAsync(ms, ct);

        var command = new AgregarDocumentoSanitarioCommand
        {
            ProveedorId = id,
            TipoDocumento = request.TipoDocumento,
            NumeroDocumento = request.NumeroDocumento,
            FechaExpedicion = request.FechaExpedicion,
            FechaVencimiento = request.FechaVencimiento,
            NombreArchivo = request.Archivo.FileName,
            ContenidoArchivo = ms.ToArray()
        };

        var documentoId = await Mediator.Send(command, ct);
        return Created(string.Empty, new { id = documentoId });
    }

    [HttpDelete("{proveedorId:guid}/documentos/{documentoId:guid}")]
    [Authorize(Roles = $"{ActiveDirectoryGroups.AppCalidad},{ActiveDirectoryGroups.Administrativo}")]
    public async Task<IActionResult> EliminarDocumento(
        Guid proveedorId, Guid documentoId, CancellationToken ct)
    {
        await Mediator.Send(
            new EliminarDocumentoSanitarioCommand(proveedorId, documentoId), ct);
        return NoContent();
    }
}