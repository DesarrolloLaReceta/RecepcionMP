using SistemaRecepcionMP.Application.Features.Categorias.Queries;
using Microsoft.AspNetCore.Mvc;

namespace SistemaRecepcionMP.API.Controllers;

public sealed class CategoriasController : BaseController
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken ct = default)
    {
        var result = await Mediator.Send(new GetCategoriasListQuery(), ct);
        return Ok(result);
    }
}