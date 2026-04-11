using System.DirectoryServices;
using System.Net;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;

namespace SistemaRecepcionMP.Infraestructure.Persistence.Repositories;
[System.Runtime.Versioning.SupportedOSPlatform("windows")]
public class LDAPAuthRepository : ILDAPAuthRepository
{
    private readonly IConfiguration _config;
    private readonly ILogger<LDAPAuthRepository> _logger;
    private readonly string _ldapServer;
    private readonly string _ldapDomain;
    private readonly string _ldapBaseDn;

    public LDAPAuthRepository(IConfiguration config, ILogger<LDAPAuthRepository> logger)
    {
        _config = config;
        _logger = logger;
        _ldapServer = _config["LDAP:Server"] ?? throw new InvalidOperationException("LDAP:Server not configured");
        _ldapDomain = _config["LDAP:Domain"] ?? throw new InvalidOperationException("LDAP:Domain not configured");
        _ldapBaseDn = _config["LDAP:BaseDn"] ?? throw new InvalidOperationException("LDAP:BaseDn not configured");
    }

    public async Task<bool> ValidateCredentialsAsync(string username, string password)
    {
        if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            return false;

        try
        {
            // Construir la ruta LDAP completa
            string ldapPath = $"LDAP://{_ldapServer}/{_ldapBaseDn}";
            string ldapUser = $@"{_ldapDomain}\{username}";

            _logger.LogInformation("Validando credenciales con DirectoryEntry: {LdapPath}, usuario {LdapUser}", ldapPath, ldapUser);

            using (var entry = new DirectoryEntry(ldapPath, ldapUser, password, AuthenticationTypes.Secure))
            {
                // Forzar la conexión para validar credenciales
                object nativeObject = entry.NativeObject;
                _logger.LogInformation("Autenticación exitosa para {Username}", username);
                return true;
            }
        }
        catch (DirectoryServicesCOMException ex)
        {
            _logger.LogError(ex, "Error de autenticación LDAP para {Username}: {Message}", username, ex.Message);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error general al autenticar {Username}", username);
            return false;
        }
    }

    public async Task<ADUserInfo?> GetUserInfoAsync(string username, string password)
    {
        try
        {
            string ldapPath = $"LDAP://{_ldapServer}/{_ldapBaseDn}";
            string ldapUser = $@"{_ldapDomain}\{username}";
            using (var entry = new DirectoryEntry(ldapPath, ldapUser, password, AuthenticationTypes.Secure))
            {
                using (var searcher = new DirectorySearcher(entry))
                {
                    searcher.Filter = $"(&(objectClass=user)(sAMAccountName={username}))";
                    searcher.PropertiesToLoad.Add("displayName");
                    searcher.PropertiesToLoad.Add("mail");
                    searcher.PropertiesToLoad.Add("sAMAccountName");
                    searcher.PropertiesToLoad.Add("distinguishedName");
                    var result = await Task.Run(() => searcher.FindOne());
                    if (result == null) return null;

                    string GetProperty(string propName)
                    {
                        if (result.Properties.Contains(propName) && result.Properties[propName].Count > 0)
                            return result.Properties[propName][0]?.ToString() ?? string.Empty;
                        return string.Empty;
                    }

                    return new ADUserInfo
                    {
                        SamAccountName = GetProperty("sAMAccountName"),
                        DisplayName = GetProperty("displayName"),
                        Email = GetProperty("mail"),
                        DistinguishedName = GetProperty("distinguishedName")
                    };
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al buscar información de usuario {Username}", username);
            return null;
        }
    }
}