
using SistemaRecepcionMP.Domain.Entities;

namespace SistemaRecepcionMP.Domain.Interfaces.Repositories
{
    public interface ITokenRepository
    {
        // Añadimos el parámetro roles
        string GenerateToken(Usuario usuario, List<string> roles);
    }
}