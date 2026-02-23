using SistemaRecepcionMP.API.Filters;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;
using Microsoft.OpenApi.Models;

namespace SistemaRecepcionMP.API;

public static class DependencyInjection
{
    public static IServiceCollection AddApi(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // ── Controllers ───────────────────────────────────────────────────────
        // El Filter se registra globalmente — se aplica a todos los Controllers
        // sin necesidad de decorar cada uno con [ApiExceptionFilter]
        services.AddControllers(options =>
            options.Filters.Add<ApiExceptionFilterAttribute>());

        // ── Autenticación Azure AD (Microsoft Entra ID) ───────────────────────
        // Valida el JWT Bearer token emitido por Azure AD.
        // Requiere el paquete: Microsoft.Identity.Web
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddMicrosoftIdentityWebApi(configuration.GetSection("AzureAd"));

        // ── Autorización ──────────────────────────────────────────────────────
        // Políticas por perfil de usuario — el perfil viene de la BD local,
        // no de los roles de Azure AD.
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
                Description = "Token JWT de Azure AD. Ejemplo: Bearer {token}"
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
        // Requerido por CurrentUserService para leer el ClaimsPrincipal
        services.AddHttpContextAccessor();

        return services;
    }
}