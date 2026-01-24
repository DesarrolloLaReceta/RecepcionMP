namespace RecepcionMP.Domain.Entities;

/// <summary>
/// Registra no conformidades detectadas durante calidad
/// Soporta múltiples tipos: Merma, RechazoParcial, RechazoTotal
/// Vinculada a Acción Correctiva para trazabilidad
/// </summary>
public class NoConformidad
{
    public int Id { get; set; }

    public int RecepcionId { get; set; }
    public Recepcion Recepcion { get; set; } = null!;

    public int LoteId { get; set; }
    public Lote Lote { get; set; } = null!;

    // Clasificación de no conformidad
    public TipoNoConformidad Tipo { get; set; } // Merma, RechazoParcial, RechazoTotal
    
    public string Descripcion { get; set; } = string.Empty;
    public decimal CantidadAfectada { get; set; }
    public string UnidadMedida { get; set; } = string.Empty;
    
    public string Causa { get; set; } = string.Empty; // Raíz de causa
    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;
    public EstadoNoConformidad Estado { get; set; } = EstadoNoConformidad.Abierta;

    // Auditoría
    public string RegistradoPor { get; set; } = string.Empty; // UserId
    public DateTime FechaUltimaActualizacion { get; set; } = DateTime.UtcNow;

    // Relaciones
    public ICollection<AccionCorrectiva> AccionesCorrectivas { get; set; } = new List<AccionCorrectiva>();

    // Métodos de dominio
    public void Cerrar()
    {
        if (Estado == EstadoNoConformidad.Cerrada)
            throw new InvalidOperationException("La no conformidad ya está cerrada");
        Estado = EstadoNoConformidad.Cerrada;
        FechaUltimaActualizacion = DateTime.UtcNow;
    }

    public void Reabrir()
    {
        if (Estado == EstadoNoConformidad.Abierta)
            throw new InvalidOperationException("La no conformidad ya está abierta");
        Estado = EstadoNoConformidad.Abierta;
        FechaUltimaActualizacion = DateTime.UtcNow;
    }

    public bool TieneMotivoValidoParaCerrar()
    {
        // Todas las acciones correctivas deben estar cerradas
        return AccionesCorrectivas.All(a => a.Estado == EstadoAccionCorrectiva.Cerrada);
    }
}

/// <summary>
/// Tipos de no conformidad según Res. 2674/2013
/// </summary>
public enum TipoNoConformidad
{
    Merma,           // Pérdida de cantidad
    RechazoParcial,  // Rechazo de parte del lote
    RechazoTotal     // Rechazo completo del lote
}

/// <summary>
/// Estados de una no conformidad en su ciclo de vida
/// </summary>
public enum EstadoNoConformidad
{
    Abierta,  // Registrada, pendiente de acciones
    Cerrada   // Todas las acciones correctivas completadas
}
