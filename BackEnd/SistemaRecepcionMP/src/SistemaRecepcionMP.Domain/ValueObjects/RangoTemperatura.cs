namespace SistemaRecepcionMP.Domain.ValueObjects;

public sealed class RangoTemperatura
{
    public decimal Minima { get; private set; }
    public decimal Maxima { get; private set; }

    // Constructor privado sin parámetros requerido por EF Core para tipos owned (OwnsOne).
    // No viola el invariante del Domain — EF lo usa solo para materializar, nunca para crear.
    private RangoTemperatura() { }

    public RangoTemperatura(decimal minima, decimal maxima)
    {
        if (minima >= maxima)
            throw new ArgumentException("La temperatura mínima debe ser menor que la máxima.");

        Minima = minima;
        Maxima = maxima;
    }

    public bool ContieneValor(decimal temperatura)
        => temperatura >= Minima && temperatura <= Maxima;

    public bool EstaFueraDeRango(decimal temperatura)
        => !ContieneValor(temperatura);

    public decimal DiferenciaConLimite(decimal temperatura)
    {
        if (temperatura < Minima) return Minima - temperatura;
        if (temperatura > Maxima) return temperatura - Maxima;
        return 0;
    }

    public override string ToString()
        => $"[{Minima}°C - {Maxima}°C]";

    // Igualdad por valor
    public override bool Equals(object? obj)
        => obj is RangoTemperatura otro &&
           Minima == otro.Minima &&
           Maxima == otro.Maxima;

    public override int GetHashCode()
        => HashCode.Combine(Minima, Maxima);
}