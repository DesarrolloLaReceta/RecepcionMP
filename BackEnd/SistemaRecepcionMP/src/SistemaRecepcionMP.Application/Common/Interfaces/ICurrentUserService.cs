using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Application.Common.Interfaces;

public interface ICurrentUserService
{
    Guid UserId { get; }
    string Nombre { get; }
    string Email { get; }
    PerfilUsuario Perfil { get; }
    bool EstaAutenticado { get; }
    bool TienePerfil(PerfilUsuario perfil);
    bool TieneAlgunPerfil(params PerfilUsuario[] perfiles);
}

