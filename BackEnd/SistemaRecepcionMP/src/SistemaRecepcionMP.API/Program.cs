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
// En desarrollo, se usa un handler que simula autenticación para facilitar pruebas sin depender de Azure AD.
if (builder.Environment.IsDevelopment())
{
    // En desarrollo, todos los requests se tratan como autenticados
    builder.Services.AddAuthentication("DevAuth")
        .AddScheme<AuthenticationSchemeOptions, DevAuthHandler>(
            "DevAuth", null);
}
else
{
    // En producción va Entra ID (cuando esté listo)
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
// Solo en Development — en producción las migraciones se ejecutan por CI/CD.
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

// 2. Swagger — solo en Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Recepción MP v1");
        options.RoutePrefix = string.Empty; // Swagger en la raíz "/"
    });
}

var wwwrootPath = Path.Combine(
    builder.Environment.ContentRootPath, "wwwroot");

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(wwwrootPath),
    RequestPath = ""
});

// 3. HTTPS redirect
app.UseHttpsRedirection();

// 4. CORS — antes de autenticación
//app.UseCors("FrontendPolicy");
app.UseCors("Dev");

// 5. Autenticación JWT (valida el token de Azure AD)
app.UseAuthentication();

// 6. Middleware que resuelve el usuario local desde la BD
// Lee el EntraId del token → busca en tabla Usuarios → inyecta perfil
app.UseMiddleware<ResolverUsuarioLocalMiddleware>();

// 7. Autorización
app.UseAuthorization();

// 8. Controllers
app.MapControllers();

await app.RunAsync();