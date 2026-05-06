using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SistemaRecepcionMP.Domain.Constants;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;

namespace SistemaRecepcionMP.Infraestructure.Persistence.Repositories;

public class TokenRepository : ITokenRepository
{
    private readonly IConfiguration _config;

    public TokenRepository(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateToken(Usuario usuario, List<string> roles)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Name, usuario.Username),
            new Claim(ClaimTypes.Email, usuario.Email),
            new Claim("local_user_id", usuario.Id.ToString()) // Importante para tu CurrentService
        };

        var allowedGroups = new HashSet<string>(ActiveDirectoryGroups.Allowed, StringComparer.OrdinalIgnoreCase);

        // Agregamos únicamente los 3 grupos válidos como claims de rol.
        foreach (var role in roles.Where(r => allowedGroups.Contains(r)).Distinct(StringComparer.OrdinalIgnoreCase))
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        // Mantenemos el perfil de la DB por compatibilidad
        claims.Add(new Claim("PerfilLocal", usuario.Perfil.ToString()));

        // --- SOLUCIÓN AL ERROR DE COMPILACIÓN ---
        
        // 1. Creamos la llave
        var keyBytes = Encoding.UTF8.GetBytes(_config["Jwt:Key"]!);
        var securityKey = new SymmetricSecurityKey(keyBytes);
        
        // 2. Definimos 'creds' (esta es la línea que faltaba)
        var creds = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        // 3. Creamos el token usando 'creds'
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds // <--- Ahora 'creds' ya existe
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}