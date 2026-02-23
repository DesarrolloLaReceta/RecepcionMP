namespace SistemaRecepcionMP.Domain.Exceptions.Lotes;

public sealed class LoteNotFoundException : DomainException
{
    public LoteNotFoundException(Guid id)
        : base($"No se encontró el lote con ID '{id}'.") { }

    public LoteNotFoundException(string codigoInterno)
        : base($"No se encontró el lote con código interno '{codigoInterno}'.") { }
}