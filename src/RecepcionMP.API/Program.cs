using Microsoft.Identity.Web;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using RecepcionMP.Infrastructure;
using RecepcionMP.Application;
using RecepcionMP.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Infrastructure (DbContext + Repos)
builder.Services.AddInfrastructure(builder.Configuration);

// Application (Servicios de negocio)
builder.Services.AddApplication();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers(options =>
{
    options.Filters.Add<AuditoriaInterceptor>();
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Entra ID / Azure AD authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));

// Policies basadas en roles (claims 'roles')
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequiereCalidad", policy => policy.RequireClaim("roles", "Calidad"));
    options.AddPolicy("RequiereRecepcion", policy => policy.RequireClaim("roles", "Recepcion"));
});

// Registrar interceptor de auditoría
builder.Services.AddAuditoriaInterceptor();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

//app.UseAuthentication(); // Para Entra ID (Azure AD)
//app.UseAuthorization();

// Middleware personalizado
//app.UseSimpleAuthorization();
app.UseAuditoria();

app.MapControllers();

app.Run();
