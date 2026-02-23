namespace SistemaRecepcionMP.Domain.ValueObjects;

public sealed class VidaUtil
{
    public DateOnly FechaVencimiento { get; private set; }

    // Constructor privado sin parámetros requerido por EF Core para tipos owned (OwnsOne).
    private VidaUtil() { }

    public VidaUtil(DateOnly fechaVencimiento)
    {
        FechaVencimiento = fechaVencimiento;
    }

    public int DiasRestantes
    {
        get
        {
            var hoy = DateOnly.FromDateTime(DateTime.UtcNow);
            return FechaVencimiento.DayNumber - hoy.DayNumber;
        }
    }

    public bool EstaVencido
        => DiasRestantes < 0;

    public bool VenceProximamente(int diasUmbral = 30)
        => DiasRestantes >= 0 && DiasRestantes <= diasUmbral;

    public bool CumpleVidaUtilMinima(int diasMinimosExigidos)
        => DiasRestantes >= diasMinimosExigidos;

    public override string ToString()
        => $"Vence: {FechaVencimiento:dd/MM/yyyy} ({DiasRestantes} días restantes)";

    // Igualdad por valor
    public override bool Equals(object? obj)
        => obj is VidaUtil otro &&
           FechaVencimiento == otro.FechaVencimiento;

    public override int GetHashCode()
        => HashCode.Combine(FechaVencimiento);
}