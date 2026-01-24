using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Builder;
using RecepcionMP.Infrastructure.Services;

namespace RecepcionMP.API.Middleware
{
    public class AuthorizationMiddleware
    {
        private readonly RequestDelegate _next;

        public AuthorizationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            using var scope = context.RequestServices.CreateScope();
            var roleProvider = scope.ServiceProvider
                .GetRequiredService<RoleClaimsProvider>();

            var path = context.Request.Path.Value ?? string.Empty;

            if (path.Contains("/calidad", StringComparison.OrdinalIgnoreCase))
            {
                if (!roleProvider.HasRole(context.User, "Calidad"))
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsync("Forbidden: requiere rol Calidad");
                    return;
                }
            }

            if (path.Contains("/recepcion", StringComparison.OrdinalIgnoreCase))
            {
                if (!roleProvider.HasRole(context.User, "Recepcion"))
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsync("Forbidden: requiere rol Recepcion");
                    return;
                }
            }

            await _next(context);
        }
    }

    public static class AuthorizationMiddlewareExtensions
    {
        public static IApplicationBuilder UseSimpleAuthorization(this IApplicationBuilder app)
        {
            return app.UseMiddleware<AuthorizationMiddleware>();
        }
    }
}
