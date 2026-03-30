using SistemaRecepcionMP.Application.Common.Exceptions;
using SistemaRecepcionMP.Domain.Exceptions;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Text.Json;

namespace SistemaRecepcionMP.API.Middlewares;

/// <summary>
/// Intercepta todas las excepciones no controladas y las convierte en
/// respuestas HTTP estandarizadas usando ProblemDetails (RFC 7807).
/// </summary>
public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Excepción no controlada: {Mensaje}", ex.Message);
            await ManejarExcepcionAsync(context, ex);
        }
    }

    private static async Task ManejarExcepcionAsync(HttpContext context, Exception excepcion)
    {
        context.Response.ContentType = "application/problem+json";

        var (statusCode, problemDetails) = excepcion switch
        {
            // 400 — errores de validación con detalle por campo
            ValidationException ex => (
                HttpStatusCode.BadRequest,
                new ValidationProblemDetails(ex.Errors)
                {
                    Title = "Error de validación",
                    Status = StatusCodes.Status400BadRequest,
                    Detail = "Una o más propiedades fallaron la validación."
                }),

            // 403 — usuario autenticado sin permiso
            ForbiddenAccessException ex => (
                HttpStatusCode.Forbidden,
                new ProblemDetails
                {
                    Title = "Acceso denegado",
                    Status = StatusCodes.Status403Forbidden,
                    Detail = ex.Message
                }),

            // 422 — regla de negocio violada
            BusinessRuleException ex => (
                HttpStatusCode.UnprocessableEntity,
                new ProblemDetails
                {
                    Title = "Regla de negocio",
                    Status = StatusCodes.Status422UnprocessableEntity,
                    Detail = ex.Message
                }),

            // 404 — entidad no encontrada (todas las NotFoundException del Domain)
            NotFoundException ex => (
                HttpStatusCode.NotFound,
                new ProblemDetails
                {
                    Title = "Recurso no encontrado",
                    Status = StatusCodes.Status404NotFound,
                    Detail = ex.Message
                }),

            // 500 — cualquier otra excepción
            _ => (
                HttpStatusCode.InternalServerError,
                new ProblemDetails
                {
                    Title = "Error interno del servidor",
                    Status = StatusCodes.Status500InternalServerError,
                    Detail = "Ocurrió un error inesperado. Contacte al administrador."
                })
        };

        context.Response.StatusCode = (int)statusCode;

        var opciones = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        await context.Response.WriteAsync(
            JsonSerializer.Serialize(problemDetails, opciones));
    }
}