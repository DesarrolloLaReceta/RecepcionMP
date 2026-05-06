using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Infraestructure.Persistence;
using System.Security.Claims;

public class UsuarioMiddleware
{
    private readonly RequestDelegate _next;

    public UsuarioMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ICurrentUserService currentUser, ApplicationDbContext dbContext)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            // 1. Extraemos los grupos del AD que metimos en el Token (Claims de tipo Role)
            var roles = context.User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();

            // 2. Establecemos el perfil de forma dinámica basándonos en los grupos
            // Dentro de UsuarioMiddleware.cs
            if (roles.Contains("App_Recepcion_LE"))
            {
                currentUser.EstablecerPerfilDesdeNombre("App_Recepcion_LE");
            }
            else if (roles.Contains("App_Calidad_LE"))
            {
                currentUser.EstablecerPerfilDesdeNombre("App_Calidad_LE");
            }
        }

        await _next(context);
    }
}