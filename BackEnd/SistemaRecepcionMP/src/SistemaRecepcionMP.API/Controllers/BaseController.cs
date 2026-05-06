using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaRecepcionMP.Application.Common.Interfaces;

namespace SistemaRecepcionMP.API.Controllers;
 
[ApiController]
[Authorize]
[Route("api/[controller]")]
[Produces("application/json")]
public abstract class BaseController : ControllerBase
{
    private ISender? _mediator;
    // 1. Necesitas declarar esta variable privada para que funcione el patrón que estás usando
    private ICurrentUserService? _currentUser; 

    protected ISender Mediator
        => _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();

    // 2. Ahora sí, la propiedad puede usar _currentUser para el "null-coalescing assignment"
    protected ICurrentUserService CurrentUser
        => _currentUser ??= HttpContext.RequestServices.GetRequiredService<ICurrentUserService>();
}