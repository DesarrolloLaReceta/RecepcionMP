using Microsoft.AspNetCore.Mvc;
using RecepcionMP.Application.DTOs.Proveedor;
using RecepcionMP.Application.Interfaces;

namespace RecepcionMP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProveedoresController : ControllerBase
    {
        private readonly IProveedorService _service;

        public ProveedoresController(IProveedorService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.ObtenerTodosActivosAsync());
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var proveedor = await _service.ObtenerPorIdAsync(id);
            return proveedor is null ? NotFound() : Ok(proveedor);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateProveedorDto dto)
        {
            var id = await _service.CrearAsync(dto);
            return CreatedAtAction(nameof(Get), new { id }, null);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, UpdateProveedorDto dto)
        {
            await _service.ActualizarAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public IActionResult Delete(int id)
        {
            return StatusCode(501); // Not implemented in service
        }
    }
}
