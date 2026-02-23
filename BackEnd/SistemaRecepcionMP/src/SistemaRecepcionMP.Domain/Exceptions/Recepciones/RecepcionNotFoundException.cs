namespace SistemaRecepcionMP.Domain.Exceptions.Recepciones;

public sealed class RecepcionNotFoundException : DomainException
{
    public RecepcionNotFoundException(Guid id)
        : base($"No se encontró la recepción con ID '{id}'.") { }

    public RecepcionNotFoundException(string numeroRecepcion)
        : base($"No se encontró la recepción con número '{numeroRecepcion}'.") { }
}