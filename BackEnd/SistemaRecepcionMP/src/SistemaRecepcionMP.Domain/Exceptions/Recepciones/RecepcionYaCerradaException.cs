namespace SistemaRecepcionMP.Domain.Exceptions.Recepciones;

public sealed class RecepcionYaCerradaException : DomainException
{
    public RecepcionYaCerradaException(string numeroRecepcion)
        : base($"La recepción '{numeroRecepcion}' ya fue cerrada y no admite modificaciones.") { }
}