using SistemaRecepcionMP.API;
using SistemaRecepcionMP.API.Middlewares;
using Microsoft.EntityFrameworkCore;
using SistemaRecepcionMP.Infraestructure.Persistence;
using SistemaRecepcionMP.Application;
using SistemaRecepcionMP.Infraestructure;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;
using SistemaRecepcionMP.Infraestructure.Persistence.Repositories;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text;

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
builder.Services.AddScoped<ILDAPAuthRepository, LDAPAuthRepository>();
builder.Services.AddScoped<ITokenRepository, TokenRepository>();

// ─── Autenticación JWT (único esquema) ─────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Key"] 
    ?? throw new InvalidOperationException("JWT Key no configurada. Use 'Jwt:Key' en appsettings o User Secrets.");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

// ─── Configuración de CORS ──────────────────────────────────────────────────
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

// ─── Pipeline HTTP ────────────────────────────────────────────────────────────
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Recepción MP v1");
        options.RoutePrefix = "swagger";
    });
}

var wwwrootPath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot");
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(wwwrootPath),
    RequestPath = ""
});

app.UseHttpsRedirection();
app.UseCors("Dev");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html");

await app.RunAsync();