using Microsoft.AspNetCore.Mvc.Filters;
using RecepcionMP.Application.Interfaces.Repositories;
using Microsoft.Extensions.DependencyInjection;
using RecepcionMP.Domain.Entities;

namespace RecepcionMP.API.Middleware
{
    /// <summary>
    /// Action filter that records audit entries for controller actions related to recepciones.
    /// Complements the existing AuditoriaMiddleware with action-level details.
    /// </summary>
    public class AuditoriaInterceptor : IAsyncActionFilter
    {
        private readonly IAuditoriaRepository _auditoriaRepository;

        public AuditoriaInterceptor(IAuditoriaRepository auditoriaRepository)
        {
            _auditoriaRepository = auditoriaRepository;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var path = context.HttpContext.Request.Path.Value ?? string.Empty;
            if (!path.Contains("/recepcion", System.StringComparison.OrdinalIgnoreCase))
            {
                await next();
                return;
            }

            var userId = context.HttpContext.User?.Identity?.Name ?? "anonymous";
            var actionName = context.ActionDescriptor.DisplayName ?? "action";

            // Execute action
            var executed = await next();

            var registro = new RegistroAuditoria
            {
                UsuarioId = userId,
                NombreUsuario = userId,
                Email = context.HttpContext.User?.FindFirst("email")?.Value ?? string.Empty,
                IP = context.HttpContext.Connection.RemoteIpAddress?.ToString(),
                FechaHora = DateTime.UtcNow,
                Tabla = "Recepcion",
                RegistroId = 0,
                Accion = TipoAccion.Actualizar,
                ValoresAntes = null,
                ValoresDespues = null,
                Descripcion = $"{actionName} -> {path}"
            };

            await _auditoriaRepository.LogAsync(registro);
        }
    }

    // Extension to register the interceptor globally if desired
    public static class AuditoriaInterceptorExtensions
    {
        public static void AddAuditoriaInterceptor(this IServiceCollection services)
        {
            services.AddScoped<AuditoriaInterceptor>();
        }
    }
}
