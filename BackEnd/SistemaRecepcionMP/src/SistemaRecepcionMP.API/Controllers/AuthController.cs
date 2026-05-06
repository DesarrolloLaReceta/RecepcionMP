

using Microsoft.AspNetCore.Mvc;
using SistemaRecepcionMP.Application.Common.Mappings;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Interfaces;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;

namespace SistemaRecepcionMP.API.Controllers;
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ILDAPAuthRepository _ldap;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITokenRepository _tokenRepository;
    private readonly ILogger<AuthController> _logger;  // ← agregar logger

    public AuthController(ILDAPAuthRepository ldap, IUnitOfWork unitOfWork, ITokenRepository tokenRepository, ILogger<AuthController> logger)
    {
        _ldap = ldap;
        _unitOfWork = unitOfWork;
        _tokenRepository = tokenRepository;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Intento de login para usuario: {Username}", request.Username);
        
        // 1. Validar contra LDAP
        var isValid = await _ldap.ValidateCredentialsAsync(request.Username, request.Password);
        if (!isValid)
        {
            _logger.LogWarning("Credenciales inválidas para usuario: {Username}", request.Username);
            return Unauthorized("Credenciales inválidas");
        }
        _logger.LogInformation("Credenciales LDAP válidas para {Username}", request.Username);

        // 2. Obtener información del usuario desde LDAP
        var adInfo = await _ldap.GetUserInfoAsync(request.Username, request.Password);
        if (adInfo == null)
        {
            _logger.LogWarning("Usuario {Username} no encontrado en AD", request.Username);
            return Unauthorized("Usuario no encontrado en AD");
        }

        // --- NUEVA VALIDACIÓN DE SEGURIDAD POR GRUPOS ---
        // Verificamos si el usuario pertenece al menos a uno de los grupos autorizados
        var gruposUsuario = adInfo.Groups ?? new List<string>(); // Asegúrate que tu DTO adInfo tenga 'Groups'
        var tienePermiso = gruposUsuario.Any(g => g.Contains("App_Recepcion_LE") || g.Contains("App_Calidad_LE"));

        if (!tienePermiso)
        {
            _logger.LogWarning("Usuario {Username} autenticado pero no pertenece a grupos autorizados", request.Username);
            return Unauthorized("No tienes permisos para acceder a esta aplicación.");
        }
        // ------------------------------------------------

        // 3. Buscar o crear el usuario en la base de datos local
        var usuario = await _unitOfWork.Usuarios.GetByUsernameAsync(adInfo.SamAccountName);
        if (usuario == null)
        {
            _logger.LogInformation("Usuario {Username} no existe en BD local, creando...", adInfo.SamAccountName);
    
            // Asignamos el perfil dinámicamente según el grupo de AD
            var perfilInicial = PerfilUsuario.RecepcionAlmacen; // Un valor por defecto seguro
            if (gruposUsuario.Any(g => g.Contains("App_Recepcion_LE"))) perfilInicial = PerfilUsuario.RecepcionAlmacen;
            // else if (gruposUsuario.Any(g => g.Contains("App_Calidad_LE"))) perfilInicial = PerfilUsuario.Calidad;

            usuario = new Usuario
            {
                Id = Guid.NewGuid(),
                Username = adInfo.SamAccountName,
                Nombre = adInfo.DisplayName ?? adInfo.SamAccountName,
                Email = adInfo.Email ?? "",
                Perfil = perfilInicial, // <-- Ya no es fijo, depende del AD
                Activo = true,
                CreadoEn = DateTime.UtcNow
            };
            await _unitOfWork.Usuarios.AddAsync(usuario);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        // 4. Generar token JWT
        // IMPORTANTE: Aquí pasamos 'gruposUsuario' como segundo argumento
        var token = _tokenRepository.GenerateToken(usuario, adInfo.Groups ?? new List<string>()); 

        _logger.LogInformation("Token JWT generado con grupos de AD para usuario {Username}", usuario.Username);

        // Devolvemos también los grupos al frontend por si React los necesita
        return Ok(new { 
            token, 
            usuario.Nombre, 
            Perfil = usuario.Perfil.ToString(),
            Grupos = gruposUsuario 
        });
    }
} 