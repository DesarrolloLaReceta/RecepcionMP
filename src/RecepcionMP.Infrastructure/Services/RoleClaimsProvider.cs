using System.Linq;
using System.Security.Claims;

namespace RecepcionMP.Infrastructure.Services
{
    /// <summary>
    /// Normaliza y provee utilidades sobre claims de rol.
    /// </summary>
    public class RoleClaimsProvider
    {
        public bool HasRole(ClaimsPrincipal user, string requiredRole)
        {
            if (user == null || string.IsNullOrWhiteSpace(requiredRole))
                return false;

            // 'roles' claim is commonly used with Entra ID for app roles
            var roles = user.Claims.Where(c => c.Type == "roles" || c.Type == ClaimTypes.Role).Select(c => c.Value);
            return roles.Any(r => string.Equals(r, requiredRole, System.StringComparison.OrdinalIgnoreCase));
        }
    }
}
