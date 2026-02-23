using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace SistemaRecepcionMP.Application.Common.Behaviours;

/// <summary>
/// Marca los Commands que deben generar registro de auditoría automático.
/// Implementar esta interfaz en los Commands que modifican datos críticos.
/// </summary>
public interface IAuditableCommand
{
    string EntidadAfectada { get; }
    string RegistroId { get; }
}

/// <summary>
/// Intercepta Commands que implementan IAuditableCommand y crea
/// automáticamente el registro en BitacoraAuditoria después de
/// que el Handler se ejecuta exitosamente.
/// Los Commands que NO implementen IAuditableCommand se ignoran.
/// </summary>
public sealed class AuditBehaviour<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ICurrentUserService _currentUser;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AuditBehaviour<TRequest, TResponse>> _logger;

    public AuditBehaviour(
        ICurrentUserService currentUser,
        IUnitOfWork unitOfWork,
        ILogger<AuditBehaviour<TRequest, TResponse>> logger)
    {
        _currentUser = currentUser;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        // Si el Command no es auditable, continúa sin hacer nada
        if (request is not IAuditableCommand auditableCommand)
            return await next();

        // Captura el estado antes de ejecutar el Handler
        var valorAntes = SerializarSeguro(request);

        // Ejecuta el Handler
        var response = await next();

        // Solo audita si el Handler tuvo éxito (no lanzó excepción)
        try
        {
            var accion = ObtenerAccion(typeof(TRequest).Name);
            var valorDespues = SerializarSeguro(response);

            var registro = new BitacoraAuditoria
            {
                UsuarioId = _currentUser.UserId,
                EntidadAfectada = auditableCommand.EntidadAfectada,
                RegistroId = auditableCommand.RegistroId,
                Accion = accion,
                ValorAnterior = valorAntes,
                ValorNuevo = valorDespues,
                IpOrigen = null, // se puede enriquecer desde ICurrentUserService
                FechaHora = DateTime.UtcNow
            };

            await _unitOfWork.Bitacora.AddAsync(registro);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            // La auditoría nunca debe interrumpir el flujo principal
            _logger.LogError(ex,
                "[AUDIT ERROR] No se pudo registrar auditoría para {RequestName}. " +
                "La operación principal fue exitosa.",
                typeof(TRequest).Name);
        }

        return response;
    }

    private static AccionAuditoria ObtenerAccion(string requestName)
    {
        if (requestName.StartsWith("Crear") || requestName.StartsWith("Registrar") || requestName.StartsWith("Iniciar"))
            return AccionAuditoria.Crear;
        if (requestName.StartsWith("Actualizar") || requestName.StartsWith("Editar"))
            return AccionAuditoria.Editar;
        if (requestName.StartsWith("Eliminar"))
            return AccionAuditoria.Eliminar;
        if (requestName.StartsWith("Liberar"))
            return AccionAuditoria.Liberar;
        if (requestName.StartsWith("Rechazar"))
            return AccionAuditoria.Rechazar;

        return AccionAuditoria.Editar;
    }

    private static string? SerializarSeguro(object? obj)
    {
        if (obj is null) return null;

        try
        {
            return JsonSerializer.Serialize(obj, new JsonSerializerOptions
            {
                WriteIndented = false,
                DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
            });
        }
        catch
        {
            return $"[No serializable: {obj.GetType().Name}]";
        }
    }
}