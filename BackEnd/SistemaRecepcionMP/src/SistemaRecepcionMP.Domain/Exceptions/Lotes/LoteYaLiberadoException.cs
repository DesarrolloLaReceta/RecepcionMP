namespace SistemaRecepcionMP.Domain.Exceptions.Lotes;

public sealed class LoteYaLiberadoException : DomainException
{
    public LoteYaLiberadoException(Guid loteId)
        : base($"El lote con ID '{loteId}' ya fue liberado y no puede procesarse nuevamente.") { }

    public LoteYaLiberadoException(string codigoInterno)
        : base($"El lote '{codigoInterno}' ya fue liberado y no puede procesarse nuevamente.") { }
}