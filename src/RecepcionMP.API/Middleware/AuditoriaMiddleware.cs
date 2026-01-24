using RecepcionMP.Application.Interfaces.Repositories;
using RecepcionMP.Domain.Entities;

namespace RecepcionMP.API.Middleware
{
    public class AuditoriaMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IServiceScopeFactory _scopeFactory;

        public AuditoriaMiddleware(
            RequestDelegate next,
            IServiceScopeFactory scopeFactory)
        {
            _next = next;
            _scopeFactory = scopeFactory;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Solo auditar operaciones sobre recepciones por ruta
            var path = context.Request.Path.Value ?? string.Empty;
            if (!path.Contains("/recepcion", StringComparison.OrdinalIgnoreCase))
            {
                await _next(context);
                return;
            }

            // Capturar request body (si es JSON)
            context.Request.EnableBuffering();
            string? body = null;
            if (context.Request.ContentLength > 0 && context.Request.Body.CanRead)
            {
                context.Request.Body.Position = 0;
                using var sr = new StreamReader(context.Request.Body, leaveOpen: true);
                body = await sr.ReadToEndAsync();
                context.Request.Body.Position = 0;
            }

            await _next(context);

            // Resolver scoped aquí (CORRECTO)
            using var scope = _scopeFactory.CreateScope();
            var auditoriaRepository =
                scope.ServiceProvider.GetRequiredService<IAuditoriaRepository>();

            var userId = context.User?.Identity?.Name ?? "anonymous";
            var registro = new RegistroAuditoria
            {
                UsuarioId = userId,
                NombreUsuario = userId,
                Email = "",
                IP = context.Connection.RemoteIpAddress?.ToString(),
                FechaHora = DateTime.UtcNow,
                Tabla = "Recepcion",
                RegistroId = 0,
                Accion = TipoAccion.Actualizar,
                ValoresAntes = null,
                ValoresDespues = body,
                Descripcion = $"Acceso a {path}"
            };

            await auditoriaRepository.LogAsync(registro);
        }
    }

    public static class AuditoriaMiddlewareExtensions
    {
        public static IApplicationBuilder UseAuditoria(this IApplicationBuilder app)
        {
            return app.UseMiddleware<AuditoriaMiddleware>();
        }
    }
}
