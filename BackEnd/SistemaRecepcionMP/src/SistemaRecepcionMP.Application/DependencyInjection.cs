using SistemaRecepcionMP.Application.Common.Behaviours;
using SistemaRecepcionMP.Application.Common.Mappings;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace SistemaRecepcionMP.Application;

/// <summary>
/// Punto único de registro de todos los servicios de la capa Application.
/// Se invoca desde la API con: builder.Services.AddApplication();
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // ── AutoMapper ────────────────────────────────────────────────────────
        // Escanea el ensamblado y registra todos los perfiles que hereden de Profile.
        // MappingProfile.cs se registra automáticamente.
        services.AddAutoMapper(cfg => cfg.AddMaps(assembly));

        // ── FluentValidation ──────────────────────────────────────────────────
        // Escanea el ensamblado y registra todos los AbstractValidator<T>.
        // Cada XxxCommandValidator se registra automáticamente.
        services.AddValidatorsFromAssembly(assembly);

        // ── MediatR ───────────────────────────────────────────────────────────
        // Escanea el ensamblado y registra todos los IRequestHandler<,>.
        // Cada XxxCommandHandler y XxxQueryHandler se registra automáticamente.
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(assembly);

            // Pipeline de Behaviours — el orden importa:
            // 1. Logging  → mide el tiempo total incluyendo validación
            // 2. Validation → corta si hay errores antes de llegar al Handler
            // 3. Audit    → registra en bitácora solo si el Handler tuvo éxito
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehaviour<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(AuditBehaviour<,>));
        });

        return services;
    }
}