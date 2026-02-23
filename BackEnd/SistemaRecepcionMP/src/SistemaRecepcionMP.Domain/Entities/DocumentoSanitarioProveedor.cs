using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Domain.Entities;
/*
public class DocumentoSanitarioProveedor : BaseEntity
{
    public Guid ProveedorId { get; set; }
    public TipoDocumento TipoDocumento { get; set; }
    public string NumeroDocumento { get; set; } = string.Empty;
    public DateOnly FechaExpedicion { get; set; }
    public DateOnly FechaVencimiento { get; set; }
    public string? AdjuntoUrl { get; set; }
    public EstadoVigencia EstadoVigencia { get; set; }

    // Navegación
    public Proveedor Proveedor { get; set; } = null!;
}
*/
public class DocumentoSanitarioProveedor : BaseEntity
{
    public Guid ProveedorId { get; set; }
    public TipoDocumento TipoDocumento { get; set; }
    public string NumeroDocumento { get; set; } = string.Empty;
    public DateOnly FechaExpedicion { get; set; }
    public DateOnly FechaVencimiento { get; set; }
    public string? AdjuntoUrl { get; set; }

    // Navegación
    public Proveedor Proveedor { get; set; } = null!;

    // ── Propiedades calculadas de dominio ───────────────

    private static DateOnly Hoy => DateOnly.FromDateTime(DateTime.UtcNow);

    public bool EstaVigente => Hoy <= FechaVencimiento;

    public bool EstaVencido => Hoy > FechaVencimiento;

    public bool VenceProximamente(int diasUmbral = 30)
        => EstaVigente && (FechaVencimiento.DayNumber - Hoy.DayNumber) <= diasUmbral;

    public int DiasParaVencer
        => FechaVencimiento.DayNumber - Hoy.DayNumber;

    public EstadoVigencia EstadoVigencia => this switch
    {
        _ when EstaVencido                => EstadoVigencia.Vencido,
        _ when VenceProximamente()        => EstadoVigencia.PorVencer,
        _                                 => EstadoVigencia.Vigente
    };
}