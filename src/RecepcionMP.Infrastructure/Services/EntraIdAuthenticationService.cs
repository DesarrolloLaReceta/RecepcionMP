using System.Security.Claims;
using Microsoft.Extensions.Configuration;

namespace RecepcionMP.Infrastructure.Services
{
    /// <summary>
    /// Helper service to expose Entra ID configuration and obtain info from claims.
    /// </summary>
    public class EntraIdAuthenticationService
    {
        private readonly IConfiguration _configuration;

        public EntraIdAuthenticationService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string? GetTenantId()
        {
            return _configuration["AzureAd:TenantId"] ?? _configuration["AzureAd:Tenant"];
        }

        public string? GetClientId()
        {
            return _configuration["AzureAd:ClientId"];
        }

        public string? GetPolicyFromClaims(ClaimsPrincipal user)
        {
            // Example helper: returns first role claim if present
            var role = user?.FindFirst("roles")?.Value;
            return role;
        }
    }
}
