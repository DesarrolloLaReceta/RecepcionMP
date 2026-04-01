using SistemaRecepcionMP.API;
using SistemaRecepcionMP.API.Middlewares;
using Microsoft.EntityFrameworkCore;
using SistemaRecepcionMP.Infraestructure.Persistence;
using SistemaRecepcionMP.Application;
using SistemaRecepcionMP.Infraestructure;
using Microsoft.AspNetCore.Authentication;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;
using SistemaRecepcionMP.Infraestructure.Persistence.Repositories;

var builder = WebApplication.CreateBuilder(args);

// ─── Registro de servicios ────────────────────────────────────────────────────
builder.Services
    .AddApi(builder.Configuration)
    .AddApplication()
    .AddInfraestructure(builder.Configuration, builder.Environment);

// ─── Repositorios ───────────────────────────────────────────────────────────
builder.Services.AddScoped<IRecepcionRepository, RecepcionRepository>();
builder.Services.AddScoped<IOrdenCompraRepository, OrdenCompraRepository>();
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<ILoteRecibidoRepository, LoteRecibidoRepository>();
builder.Services.AddScoped<IItemRepository, ItemRepository>();
builder.Services.AddScoped<ICheckListBPMRepository, CheckListBPMRepository>();
builder.Services.AddScoped<INoConformidadRepository, NoConformidadRepository>();
builder.Services.AddScoped<ITemperaturaRegistroRepository, TemperaturaRegistroRepository>();
builder.Services.AddScoped<IBitacoraAuditoriaRepository, BitacoraAuditoriaRepository>();

// ─── Autenticación ─────────────────────────────────────────────────────────
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddAuthentication("DevAuth")
        .AddScheme<AuthenticationSchemeOptions, DevAuthHandler>("DevAuth", null);
}
else
{
    builder.Services.AddAuthentication();
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("Dev", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ─── Build de la aplicación ───────────────────────────────────────────────────
var app = builder.Build();

// ─── Migraciones automáticas al arrancar ─────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await db.Database.MigrateAsync();
    await DataSeeder.SeedAsync(db);
}

// ─── Pipeline HTTP — el orden importa ────────────────────────────────────────

// 1. Manejo global de excepciones — siempre primero para capturar todo
app.UseMiddleware<ExceptionHandlingMiddleware>();

// 2. Swagger — solo en Development (ahora en /swagger)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Recepción MP v1");
        options.RoutePrefix = "swagger"; // ← Swagger en /swagger, no en la raíz
    });
}

// 3. Servir archivos estáticos desde wwwroot (donde está el frontend)
var wwwrootPath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot");
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(wwwrootPath),
    RequestPath = ""
});

// 4. HTTPS redirect
app.UseHttpsRedirection();

// 5. CORS — antes de autenticación
app.UseCors("Dev");

// 6. Autenticación JWT
app.UseAuthentication();

// 7. Middleware que resuelve el usuario local desde la BD
app.UseMiddleware<ResolverUsuarioLocalMiddleware>();

// 8. Autorización
app.UseAuthorization();

// 9. Controllers
app.MapControllers();

// 10. Fallback SPA: cualquier ruta no encontrada sirve index.html
app.MapFallbackToFile("index.html");

await app.RunAsync();