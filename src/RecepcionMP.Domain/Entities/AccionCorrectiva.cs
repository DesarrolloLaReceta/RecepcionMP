namespace RecepcionMP.Domain.Entities;

/// <summary>
/// Acción correctiva vinculada a una no conformidad
/// Soporta auditoría completa y trazabilidad de responsables
/// </summary>
public class AccionCorrectiva
{
    public int Id { get; set; }

    public int NoConformidadId { get; set; }
    public NoConformidad NoConformidad { get; set; } = null!;

    public string Descripcion { get; set; } = string.Empty;
    public string Responsable { get; set; } = string.Empty; // UserId
    
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    public DateTime FechaVencimiento { get; set; }
    public DateTime? FechaCompletacion { get; set; }

    public EstadoAccionCorrectiva Estado { get; set; } = EstadoAccionCorrectiva.Abierta;
    public string Observaciones { get; set; } = string.Empty;

    // Auditoría
    public string CreadaPor { get; set; } = string.Empty; // UserId
    public string? CerradaPor { get; set; } // UserId (cuando se cierre)
    public DateTime FechaUltimaActualizacion { get; set; } = DateTime.UtcNow;

    // Métodos de dominio
    public void Cerrar(string observacionesCierre, string usuarioCierre)
    {
        if (Estado == EstadoAccionCorrectiva.Cerrada)
            throw new InvalidOperationException("La acción correctiva ya está cerrada");

        if (string.IsNullOrWhiteSpace(usuarioCierre))
            throw new ArgumentException("Usuario que cierra es requerido", nameof(usuarioCierre));

        Estado = EstadoAccionCorrectiva.Cerrada;
        FechaCompletacion = DateTime.UtcNow;
        CerradaPor = usuarioCierre;
        Observaciones = observacionesCierre ?? string.Empty;
        FechaUltimaActualizacion = DateTime.UtcNow;
    }

    public void Reabrir(string motivo, string usuarioReapertura)
    {
        if (Estado == EstadoAccionCorrectiva.Abierta)
            throw new InvalidOperationException("La acción correctiva ya está abierta");

        if (string.IsNullOrWhiteSpace(usuarioReapertura))
            throw new ArgumentException("Usuario que reabre es requerido", nameof(usuarioReapertura));

        Estado = EstadoAccionCorrectiva.Abierta;
        FechaCompletacion = null;
        CerradaPor = null;
        Observaciones = $"Reabierta: {motivo}";
        FechaUltimaActualizacion = DateTime.UtcNow;
    }

    public bool EstaVencida()
    {
        return Estado == EstadoAccionCorrectiva.Abierta && DateTime.UtcNow > FechaVencimiento;
    }

    public int DíasRestantes()
    {
        if (Estado == EstadoAccionCorrectiva.Cerrada)
            return 0;

        var restantes = (FechaVencimiento - DateTime.UtcNow).Days;
        return Math.Max(0, restantes);
    }
}

/// <summary>
/// Estados de una acción correctiva en su ciclo de vida
/// </summary>
public enum EstadoAccionCorrectiva
{
    Abierta,  // Pendiente de ejecución
    Cerrada   // Ejecutada y validada
}
