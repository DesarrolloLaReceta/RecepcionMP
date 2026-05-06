namespace SistemaRecepcionMP.Domain.Interfaces.Repositories;

public interface ILDAPAuthRepository
{
    Task<bool> ValidateCredentialsAsync(string username, string password);
    Task<ADUserInfo?> GetUserInfoAsync(string username, string password);
}

public class ADUserInfo
{
    public string SamAccountName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string DistinguishedName { get; set; } = string.Empty;
    public List<string> Groups { get; set; } = new List<string>();
}