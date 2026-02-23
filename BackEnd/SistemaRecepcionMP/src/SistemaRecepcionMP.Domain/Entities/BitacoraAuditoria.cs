using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Domain.Entities;

public class BitacoraAuditoria : BaseEntity
{
    public Guid UsuarioId { get; set; }
    public string EntidadAfectada { get; set; } = string.Empty;
    public string RegistroId { get; set; } = string.Empty;
    public AccionAuditoria Accion { get; set; }
    public string? ValorAnterior { get; set; }
    public string? ValorNuevo { get; set; }
    public string? IpOrigen { get; set; }
    public DateTime FechaHora { get; set; } = DateTime.UtcNow;

    // Navegación
    public Usuario Usuario { get; set; } = null!;
}