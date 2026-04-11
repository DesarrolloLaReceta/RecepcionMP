
using SistemaRecepcionMP.Domain.Entities;

namespace SistemaRecepcionMP.Domain.Interfaces.Repositories
{
    public interface ITokenRepository
    {
        string GenerateToken(Usuario usuario);
    }
}