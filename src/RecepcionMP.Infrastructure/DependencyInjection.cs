using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RecepcionMP.Application.Interfaces.Repositories;
using RecepcionMP.Application.Interfaces;
using RecepcionMP.Infrastructure.Repositories;
using RecepcionMP.Infrastructure.Services;
using RecepcionMP.Infrastructure.Persistence;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection")
            )
        ); 
        // Repositorios
        services.AddScoped<IProveedorRepository, ProveedorRepository>();
        services.AddScoped<ICategoriaRepository, CategoriaRepository>();
        services.AddScoped<IDocumentoRequeridoRepository, DocumentoRequeridoRepository>();
        services.AddScoped<IAuditoriaRepository, AuditoriaRepository>();
        services.AddScoped<IRecepcionDocumentoRepository, RecepcionDocumentoRepository>();
        services.AddScoped<IRecepcionRepository, RecepcionRepository>();
        services.AddScoped<IOrdenCompraRepository, OrdenCompraRepository>();
        services.AddScoped<IItemRepository, ItemRepository>();
        
        // Documentos:
        services.AddScoped<IDocumentoValidacionRepository, DocumentoValidacionRepository>();
        services.AddScoped<IDocumentoAdjuntoRepository, DocumentoAdjuntoRepository>();

        // Calidad:
        services.AddScoped<INoConformidadRepository, NoConformidadRepository>();
        services.AddScoped<IAccionCorrectivaRepository, AccionCorrectivaRepository>();
        services.AddScoped<ILiberacionLoteRepository, LiberacionLoteRepository>();
        services.AddScoped<ICheckListBPMCategoriaRepository, CheckListBPMCategoriaRepository>();
        services.AddScoped<ILoteRepository, LoteRepository>();

        // Eventos de Dominio:
        services.AddScoped<RecepcionMP.Domain.Interfaces.IDomainEventPublisher, DomainEventPublisher>();
        services.AddScoped<RecepcionCreadaEventHandler>();
        services.AddScoped<LoteRechazadoEventHandler>();
        services.AddScoped<RecepcionEnviadaACalidadEventHandler>();

        // Autenticación / Roles
        services.AddScoped<EntraIdAuthenticationService>();
        services.AddScoped<RoleClaimsProvider>();

        // Storage
        var storageType = configuration.GetValue<string>("Storage:Tipo");

        if (!string.IsNullOrEmpty(storageType) &&
            storageType.Equals("AzureBlob", StringComparison.OrdinalIgnoreCase))
        {
            var conn = configuration.GetConnectionString("AzureBlob")
                ?? configuration["Storage:ConnectionString"];

            if (string.IsNullOrWhiteSpace(conn))
                throw new InvalidOperationException(
                    "Storage AzureBlob configurado pero falta ConnectionString");
            var container = configuration["Storage:Contenedor"] ?? "recepcion-documentos";

            services.AddSingleton<IDocumentStorage>(
                _ => new AzureBlobDocumentStorage(conn, container));
        }
            else
        {
            services.AddSingleton<IDocumentStorage, LocalFileDocumentStorage>();
        }


        return services;
    }
}
