using SistemaRecepcionMP.API.Filters;
using Microsoft.OpenApi.Models;

namespace SistemaRecepcionMP.API;

public static class DependencyInjection
{
    public static IServiceCollection AddApi(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // ── Controllers ───────────────────────────────────────────────────────
        services.AddControllers(options =>
            options.Filters.Add<ApiExceptionFilterAttribute>());

        // ── Autenticación JWT (ya no se configura aquí, se hace en Program.cs) ──
        // Eliminada la configuración de Azure AD

        // ── Autorización ──────────────────────────────────────────────────────
        services.AddAuthorization(options =>
        {
            options.AddPolicy("Administrador", policy =>
                policy.RequireAuthenticatedUser());

            options.AddPolicy("Calidad", policy =>
                policy.RequireAuthenticatedUser());

            options.AddPolicy("Operario", policy =>
                policy.RequireAuthenticatedUser());
        });

        // ── CORS ──────────────────────────────────────────────────────────────
        services.AddCors(options =>
        {
            options.AddPolicy("FrontendPolicy", policy =>
            {
                var origenes = configuration
                    .GetSection("Cors:OrigenesPermitidos")
                    .Get<string[]>() ?? Array.Empty<string>();

                policy
                    .WithOrigins(origenes)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        // ── Swagger / OpenAPI ─────────────────────────────────────────────────
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Sistema Recepción Materia Prima",
                Version = "v1",
                Description = "API para gestión de recepción de materia prima — " +
                              "Cumplimiento Res. 2674/2013 INVIMA"
            });

            // Seguridad JWT en Swagger UI
            var securityScheme = new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Token JWT generado por el sistema. Ejemplo: Bearer {token}"
            };

            options.AddSecurityDefinition("Bearer", securityScheme);
            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });

        // ── HttpContextAccessor ───────────────────────────────────────────────
        services.AddHttpContextAccessor();

        return services;
    }
}