using SistemaRecepcionMP.Application.Common.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace SistemaRecepcionMP.Application.Common.Behaviours;

/// <summary>
/// Intercepta cada Command/Query y registra en el logger:
/// - Quién lo ejecutó y qué request fue
/// - Cuánto tardó en procesarse
/// - Si lanzó una excepción no controlada
/// No afecta el flujo, solo observa.
/// </summary>
public sealed class LoggingBehaviour<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<LoggingBehaviour<TRequest, TResponse>> _logger;
    private readonly ICurrentUserService _currentUser;

    public LoggingBehaviour(
        ILogger<LoggingBehaviour<TRequest, TResponse>> logger,
        ICurrentUserService currentUser)
    {
        _logger = logger;
        _currentUser = currentUser;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        var userId = _currentUser.EstaAutenticado ? _currentUser.UserId.ToString() : "Anónimo";
        var userName = _currentUser.EstaAutenticado ? _currentUser.Nombre : "Anónimo";

        _logger.LogInformation(
            "[START] {RequestName} | Usuario: {UserId} - {UserName} | Datos: {@Request}",
            requestName, userId, userName, request);

        var stopwatch = Stopwatch.StartNew();

        try
        {
            var response = await next();

            stopwatch.Stop();

            // Alerta si el request tardó más de 3 segundos
            if (stopwatch.ElapsedMilliseconds > 3000)
            {
                _logger.LogWarning(
                    "[SLOW] {RequestName} tardó {ElapsedMs}ms. Usuario: {UserId} | Datos: {@Request}",
                    requestName, stopwatch.ElapsedMilliseconds, userId, request);
            }
            else
            {
                _logger.LogInformation(
                    "[END] {RequestName} completado en {ElapsedMs}ms. Usuario: {UserId}",
                    requestName, stopwatch.ElapsedMilliseconds, userId);
            }

            return response;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();

            _logger.LogError(ex,
                "[ERROR] {RequestName} falló en {ElapsedMs}ms. Usuario: {UserId} - {UserName} | Datos: {@Request}",
                requestName, stopwatch.ElapsedMilliseconds, userId, userName, request);

            throw;
        }
    }
}