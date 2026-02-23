using SistemaRecepcionMP.Domain.Interfaces;
using Infrastructure.Identity;
using Microsoft.Identity.Web;

namespace SistemaRecepcionMP.API.Middlewares;

/// <summary>
/// Ejecuta después de UseAuthentication().
/// Lee el EntraId del token JWT validado → busca en la tabla Usuarios local
/// → inyecta el perfil en CurrentUserService.
///
/// Si el usuario no existe en la BD local, devuelve 403 con mensaje claro.
/// El registro de usuarios es manual por parte del Administrador.
/// </summary>
public sealed class ResolverUsuarioLocalMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ResolverUsuarioLocalMiddleware> _logger;

    public ResolverUsuarioLocalMiddleware(
        RequestDelegate next,
        ILogger<ResolverUsuarioLocalMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, IUnitOfWork unitOfWork,
        CurrentUserService currentUserService)
    {
        // Solo procesar requests autenticados
        if (context.User.Identity?.IsAuthenticated == true)
        {
            // El EntraId viene en el claim "oid" (Object ID de Azure AD)
            var entraId = context.User.GetObjectId();

            if (!string.IsNullOrEmpty(entraId))
            {
                var usuario = await unitOfWork.Usuarios.GetByEntraIdAsync(entraId);

                if (usuario is null)
                {
                    _logger.LogWarning(
                        "Usuario autenticado con EntraId {EntraId} no existe en la BD local.",
                        entraId);

                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsJsonAsync(new
                    {
                        title = "Usuario no registrado",
                        status = 403,
                        detail = "Su cuenta de Azure AD no está registrada en el sistema. " +
                                 "Contacte al administrador para que lo registre."
                    });
                    return;
                }

                if (!usuario.Activo)
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsJsonAsync(new
                    {
                        title = "Usuario inactivo",
                        status = 403,
                        detail = "Su cuenta está desactivada. Contacte al administrador."
                    });
                    return;
                }

                // Inyectar el perfil leído de la BD en el CurrentUserService
                currentUserService.EstablecerPerfil(usuario.Perfil);

                // Agregar el ID local como claim para que CurrentUserService.UserId funcione
                var identity = context.User.Identity as System.Security.Claims.ClaimsIdentity;
                identity?.AddClaim(new System.Security.Claims.Claim(
                    "local_user_id", usuario.Id.ToString()));
            }
        }

        await _next(context);
    }
}