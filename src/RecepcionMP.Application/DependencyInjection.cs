using Microsoft.Extensions.DependencyInjection;
using RecepcionMP.Application.Interfaces;
using RecepcionMP.Application.Services;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Services
        services.AddScoped<IProveedorService, ProveedorService>();
        services.AddScoped<IOrdenCompraService, OrdenCompraService>();
        services.AddScoped<IRecepcionService, RecepcionService>();
        services.AddScoped<ICategoriaService, CategoriaService>();
        services.AddScoped<IItemService, ItemService>();
        services.AddScoped<IAuditoriaService, AuditoriaService>();

        // New
        services.AddScoped<IDocumentoService, DocumentoService>();
        services.AddScoped<ICalidadService, CalidadService>();
        services.AddScoped<ITrazabilidadService, TrazabilidadService>();

        return services;
    }
}
