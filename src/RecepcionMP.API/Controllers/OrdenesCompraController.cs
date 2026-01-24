using Microsoft.AspNetCore.Mvc;
using RecepcionMP.Application.Interfaces;
using RecepcionMP.Application.DTOs.OrdenCompra;

namespace RecepcionMP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdenesCompraController : ControllerBase
    {
        private readonly IOrdenCompraService _service;

        public OrdenesCompraController(IOrdenCompraService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var ordenes = await _service.ObtenerTodasAsync();
            return Ok(ordenes);
        }

        [HttpGet("{id:int}", Name = "GetOrdenCompraById")]
        public async Task<IActionResult> ObtenerPorId(int id)
        {
            var orden = await _service.ObtenerPorIdAsync(id);
            if (orden == null)
                return NotFound();

            return Ok(orden);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateOrdenCompraDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var id = await _service.CrearAsync(dto);

            return CreatedAtRoute(
                "GetOrdenCompraById",
                new { id },
                null
            );
        }
    }
}
