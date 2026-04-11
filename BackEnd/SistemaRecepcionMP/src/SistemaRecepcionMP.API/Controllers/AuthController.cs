

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
        _logger.LogInformation("Información de AD obtenida: {SamAccountName}, {DisplayName}, {Email}", 
            adInfo.SamAccountName, adInfo.DisplayName, adInfo.Email);

        // 3. Buscar o crear el usuario en la base de datos local
        var usuario = await _unitOfWork.Usuarios.GetByUsernameAsync(adInfo.SamAccountName);
        if (usuario == null)
        {
            _logger.LogInformation("Usuario {Username} no existe en BD local, creando...", adInfo.SamAccountName);
            usuario = new Usuario
            {
                Id = Guid.NewGuid(),
                Username = adInfo.SamAccountName,
                Nombre = adInfo.DisplayName ?? adInfo.SamAccountName,
                Email = adInfo.Email ?? "",
                Perfil = PerfilUsuario.RecepcionAlmacen,
                Activo = true,
                CreadoEn = DateTime.UtcNow
            };
            await _unitOfWork.Usuarios.AddAsync(usuario);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        else if (!usuario.Activo)
        {
            _logger.LogWarning("Usuario {Username} inactivo en el sistema", usuario.Username);
            return Unauthorized("Usuario inactivo en el sistema");
        }
        else
        {
            _logger.LogInformation("Usuario {Username} encontrado en BD local", usuario.Username);
        }

        // 4. Generar token JWT
        var token = _tokenRepository.GenerateToken(usuario);
        _logger.LogInformation("Token JWT generado para usuario {Username}", usuario.Username);
        return Ok(new { token, usuario.Nombre, Perfil = usuario.Perfil.ToString() });
    }
}