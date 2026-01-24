using Microsoft.AspNetCore.Mvc;
using RecepcionMP.Application.Interfaces;
using RecepcionMP.Application.DTOs.Item;

namespace RecepcionMP.API.Controllers;

[ApiController]
[Route("api/item")]
public class ItemController : ControllerBase
{
    private readonly IItemService _service;

    public ItemController(IItemService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? categoriaId)
    {
        if (!categoriaId.HasValue)
            return BadRequest(new { error = "Se requiere 'categoriaId' como query string" });

        var list = await _service.ObtenerPorCategoriaAsync(categoriaId.Value);
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await _service.ObtenerPorIdAsync(id);
        return item is null ? NotFound() : Ok(item);
    }
}
