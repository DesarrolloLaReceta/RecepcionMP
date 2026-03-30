using SistemaRecepcionMP.Application.Common.Exceptions;
using SistemaRecepcionMP.Domain.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace SistemaRecepcionMP.API.Filters;

/// <summary>
/// Filter de excepción a nivel de Controller.
/// Complementa al ExceptionHandlingMiddleware — mientras el Middleware captura
/// cualquier excepción del pipeline completo (incluyendo otros middlewares),
/// este Filter tiene acceso al contexto del Controller: nombre del action,
/// route values y model state, lo que permite respuestas más precisas
/// para errores originados específicamente en los Controllers.
///
/// Registro: se aplica globalmente en DependencyInjection.cs via
/// services.AddControllers(options => options.Filters.Add<ApiExceptionFilterAttribute>())
/// </summary>
public sealed class ApiExceptionFilterAttribute : ExceptionFilterAttribute
{
    private readonly ILogger<ApiExceptionFilterAttribute> _logger;

    // Mapa de tipo de excepción → acción de manejo
    // Permite agregar nuevos tipos sin modificar el switch
    private readonly IDictionary<Type, Action<ExceptionContext>> _handlers;

    public ApiExceptionFilterAttribute(ILogger<ApiExceptionFilterAttribute> logger)
    {
        _logger = logger;

        _handlers = new Dictionary<Type, Action<ExceptionContext>>
        {
            { typeof(ValidationException),        ManejarValidationException },
            { typeof(ForbiddenAccessException),   ManejarForbiddenAccessException },
            { typeof(BusinessRuleException),      ManejarBusinessRuleException },
            { typeof(NotFoundException),           ManejarNotFoundException }
        };
    }

    public override void OnException(ExceptionContext context)
    {
        ManejarException(context);
        base.OnException(context);
    }

    private void ManejarException(ExceptionContext context)
    {
        var tipo = context.Exception.GetType();

        if (_handlers.TryGetValue(tipo, out var handler))
        {
            handler.Invoke(context);
            return;
        }

        // Excepción no mapeada → 500
        if (!context.ModelState.IsValid)
        {
            ManejarModelStateInvalido(context);
            return;
        }

        ManejarExcepcionDesconocida(context);
    }

    // ── Handlers por tipo ─────────────────────────────────────────────────────

    private void ManejarValidationException(ExceptionContext context)
    {
        var ex = (ValidationException)context.Exception;

        var details = new ValidationProblemDetails(ex.Errors)
        {
            Title = "Error de validación",
            Status = StatusCodes.Status400BadRequest,
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1"
        };

        context.Result = new BadRequestObjectResult(details);
        context.ExceptionHandled = true;
    }

    private void ManejarForbiddenAccessException(ExceptionContext context)
    {
        var details = new ProblemDetails
        {
            Title = "Acceso denegado",
            Status = StatusCodes.Status403Forbidden,
            Detail = context.Exception.Message,
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.3"
        };

        context.Result = new ObjectResult(details)
        {
            StatusCode = StatusCodes.Status403Forbidden
        };

        context.ExceptionHandled = true;
    }

    private void ManejarBusinessRuleException(ExceptionContext context)
    {
        var details = new ProblemDetails
        {
            Title = "Regla de negocio",
            Status = StatusCodes.Status422UnprocessableEntity,
            Detail = context.Exception.Message,
            Type = "https://tools.ietf.org/html/rfc4918#section-11.2"
        };

        context.Result = new UnprocessableEntityObjectResult(details);
        context.ExceptionHandled = true;
    }

    private void ManejarNotFoundException(ExceptionContext context)
    {
        var details = new ProblemDetails
        {
            Title = "Recurso no encontrado",
            Status = StatusCodes.Status404NotFound,
            Detail = context.Exception.Message,
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.4"
        };

        context.Result = new NotFoundObjectResult(details);
        context.ExceptionHandled = true;
    }

    private void ManejarModelStateInvalido(ExceptionContext context)
    {
        var details = new ValidationProblemDetails(context.ModelState)
        {
            Title = "Error en los datos enviados",
            Status = StatusCodes.Status400BadRequest,
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1"
        };

        context.Result = new BadRequestObjectResult(details);
        context.ExceptionHandled = true;
    }

    private void ManejarExcepcionDesconocida(ExceptionContext context)
    {
        _logger.LogError(context.Exception,
            "Excepción no controlada en {Action}: {Mensaje}",
            context.ActionDescriptor.DisplayName,
            context.Exception.Message);

        var details = new ProblemDetails
        {
            Title = "Error interno del servidor",
            Status = StatusCodes.Status500InternalServerError,
            Detail = "Ocurrió un error inesperado. Contacte al administrador.",
            Type = "https://tools.ietf.org/html/rfc7231#section-6.6.1"
        };

        context.Result = new ObjectResult(details)
        {
            StatusCode = StatusCodes.Status500InternalServerError
        };

        context.ExceptionHandled = true;
    }
}