using SistemaRecepcionMP.API;
using SistemaRecepcionMP.API.Middlewares;
using Microsoft.EntityFrameworkCore;
using SistemaRecepcionMP.Infraestructure.Persistence;
using SistemaRecepcionMP.Application;
using SistemaRecepcionMP.Infraestructure;

var builder = WebApplication.CreateBuilder(args);

// ─── Registro de servicios ────────────────────────────────────────────────────
builder.Services
    .AddApi(builder.Configuration)
    .AddApplication()
    .AddInfraestructure(builder.Configuration, builder.Environment);

// ─── Build de la aplicación ───────────────────────────────────────────────────
var app = builder.Build();

// ─── Migraciones automáticas al arrancar ─────────────────────────────────────
// Solo en Development — en producción las migraciones se ejecutan por CI/CD.
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await db.Database.MigrateAsync();
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

// 3. HTTPS redirect
app.UseHttpsRedirection();

// 4. CORS — antes de autenticación
app.UseCors("FrontendPolicy");

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