using Microsoft.AspNetCore.Mvc;
using RecepcionMP.Application.Interfaces.Repositories;
using RecepcionMP.Application.DTOs;

namespace RecepcionMP.API.Controllers;

[ApiController]
[Route("api/auditoria")]
public class AuditoriaController : ControllerBase
{
    private readonly IAuditoriaRepository _repo;

    public AuditoriaController(IAuditoriaRepository repo)
    {
        _repo = repo;
    }

    // GET: /api/auditoria?tabla=Recepcion&desde=2025-01-01&hasta=2025-01-31&registroId=123
    [HttpGet]
    public async Task<IActionResult> GetByTabla([FromQuery] string? tabla, [FromQuery] DateTime? desde, [FromQuery] DateTime? hasta, [FromQuery] int? registroId)
    {
        if (desde == null || hasta == null)
            return BadRequest(new { error = "Parámetros 'desde' y 'hasta' son requeridos" });

        var list = await _repo.GetHistorialPorFechaAsync(desde.Value, hasta.Value);

        var filtered = list.Where(r => string.IsNullOrEmpty(tabla) || r.Tabla.Equals(tabla, StringComparison.OrdinalIgnoreCase));

        if (registroId.HasValue)
            filtered = filtered.Where(r => r.RegistroId == registroId.Value);

        var dto = filtered.Select(r => new AuditoriaDto
        {
            UsuarioId = r.UsuarioId,
            NombreUsuario = r.NombreUsuario,
            IP = r.IP,
            FechaHora = r.FechaHora,
            Tabla = r.Tabla,
            RegistroId = r.RegistroId,
            Accion = (int)r.Accion,
            ValoresAntes = r.ValoresAntes,
            ValoresDespues = r.ValoresDespues,
            Descripcion = r.Descripcion
        });

        return Ok(dto);
    }
}
