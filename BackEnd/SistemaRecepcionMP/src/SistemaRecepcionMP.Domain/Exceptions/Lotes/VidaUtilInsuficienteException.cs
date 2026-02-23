namespace SistemaRecepcionMP.Domain.Exceptions.Lotes;

public sealed class VidaUtilInsuficienteException : DomainException
{
    public VidaUtilInsuficienteException(string codigoLote, int diasRestantes, int diasMinimosExigidos)
        : base($"El lote '{codigoLote}' tiene {diasRestantes} días de vida útil restante, " +
               $"pero la categoría exige un mínimo de {diasMinimosExigidos} días para su aceptación.") { }
}