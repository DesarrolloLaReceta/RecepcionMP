using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SistemaRecepcionMP.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
[Produces("application/json")]
public abstract class BaseController : ControllerBase
{
    private ISender? _mediator;

    /// <summary>
    /// MediatR se resuelve desde el DI container en cada request.
    /// Se usa property injection para no obligar a todos los Controllers a recibirlo en constructor.
    /// </summary>
    protected ISender Mediator
        => _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();
}