using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Domain.Services;
using SistemaRecepcionMP.Domain.Interfaces;
using SistemaRecepcionMP.Infrastructure.ExternalServices;
using SistemaRecepcionMP.Infrastructure.FileStorage;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Infrastructure.Identity;
using SistemaRecepcionMP.Infrastructure.Services;
using SistemaRecepcionMP.Infraestructure.Persistence.Repositories;
using SistemaRecepcionMP.Infraestructure.Persistence;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;

namespace SistemaRecepcionMP.Infraestructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfraestructure(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        // ── Base de datos ─────────────────────────────────────────────────────
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                sql =>
                {
                    sql.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                    // Reintentos automáticos ante fallos transitorios de SQL Server / Azure SQL
                    sql.EnableRetryOnFailure(
                        maxRetryCount: 5,
                        maxRetryDelay: TimeSpan.FromSeconds(30),
                        errorNumbersToAdd: null);
                }));

        // ── Unit of Work y Repositorios ───────────────────────────────────────
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // ── Identity — resolución del usuario local ───────────────────────────
        services.AddHttpContextAccessor();
        services.AddScoped<CurrentUserService>();
        services.AddScoped<ICurrentUserService>(sp => sp.GetRequiredService<CurrentUserService>());

        // ── File Storage — Azure en producción, local en desarrollo ───────────
        if (environment.IsProduction())
            services.AddScoped<IFileStorageService, AzureBlobStorageService>();
        else
            services.AddScoped<IFileStorageService, LocalFileStorageService>();

        // ── Servicios externos ────────────────────────────────────────────────
        services.AddScoped<IQrCodeService, QrCodeService>();
        services.AddScoped<IEmailService, EmailService>();

        // Agregamos el servicio de fecha para Colombia
        services.AddTransient<IDateTime, DateTimeService>();

        services.AddScoped<IRecepcionRepository, RecepcionRepository>();

        services.AddTransient<IDateTime, DateTimeService>();

        // ── Repositorios ──────────────────────────────────────────────────────
        services.AddScoped<IRecepcionRepository, RecepcionRepository>();
        
        // Si no tienes el IItemRepository agregado, agrégalo también:
        services.AddScoped<IItemRepository, ItemRepository>();

        // ── Servicios de Dominio ──────────────────────────────────────────────
        // Lo registramos como Scoped para que viva lo que dura la petición HTTP
        services.AddScoped<SistemaRecepcionMP.Domain.Services.RecepcionDomainService>();
        
        return services;
    }
}