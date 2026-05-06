using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Domain.Enums;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace Infrastructure.Identity;

/// <summary>
/// Implementa ICurrentUserService leyendo el JWT de Azure AD desde el HttpContext.
/// El token ya fue validado por el middleware de autenticación de ASP.NET Core.
/// El perfil (rol) del usuario se lee de la base de datos local, no del token.
/// </summary>
public sealed class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    // Perfil inyectado desde fuera — se resuelve consultando la BD en el middleware
    private PerfilUsuario? _perfil;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    /// <summary>GUID del usuario en la tabla Usuarios local (mapeado a Username).</summary>
    public Guid UserId
    {
        get
        {
            var claim = User?.FindFirst("local_user_id")?.Value;
            return Guid.TryParse(claim, out var id) ? id : Guid.Empty;
        }
    }

    public string Nombre
        => User?.FindFirst(ClaimTypes.Name)?.Value
        ?? User?.FindFirst("name")?.Value
        ?? "Sistema";

    public string Email
        => User?.FindFirst(ClaimTypes.Email)?.Value
        ?? User?.FindFirst("preferred_username")?.Value
        ?? string.Empty;

    public PerfilUsuario Perfil => _perfil ?? PerfilUsuario.RecepcionAlmacen;

    public bool EstaAutenticado
        => User?.Identity?.IsAuthenticated ?? false;

    public bool TienePerfil(PerfilUsuario perfil)
        => Perfil == perfil || Perfil == PerfilUsuario.Administrador;

    public bool TieneAlgunPerfil(params PerfilUsuario[] perfiles)
        => perfiles.Any(p => TienePerfil(p));

    /// <summary>
    /// Llamado por el middleware de resolución de usuario local para
    /// inyectar el perfil leído desde la BD.
    /// </summary>
    public void EstablecerPerfil(PerfilUsuario perfil) => _perfil = perfil;

    /// <summary>
    /// NUEVO: Permite establecer el perfil usando el nombre del grupo de AD (string).
    /// Mapea el string del AD al Enum local.
    /// </summary>
    public void EstablecerPerfilDesdeNombre(string nombrePerfil)
    {
        _perfil = nombrePerfil switch
        {
            "App_Recepcion_LE" => PerfilUsuario.RecepcionAlmacen,
            "App_Calidad_LE" => PerfilUsuario.Calidad,
            "Sistemas_LE" => PerfilUsuario.Administrador,
            _ => PerfilUsuario.RecepcionAlmacen  //Valor por defecto
        };
    }
}