using SistemaRecepcionMP.Domain.ValueObjects;

namespace SistemaRecepcionMP.Domain.Exceptions.Temperatura;

public sealed class TemperaturaFueraDeRangoException : DomainException
{
    public TemperaturaFueraDeRangoException(decimal temperaturaRegistrada, RangoTemperatura rango)
        : base($"La temperatura registrada de {temperaturaRegistrada}°C está fuera del rango permitido {rango}. " +
               $"Diferencia con el límite: {rango.DiferenciaConLimite(temperaturaRegistrada):F1}°C.") { }
}