namespace SistemaRecepcionMP.Domain.Exceptions.Lotes;

public sealed class LoteVencidoException : DomainException
{
    public LoteVencidoException(string codigoLote, DateOnly fechaVencimiento)
        : base($"El lote '{codigoLote}' está vencido desde el {fechaVencimiento:dd/MM/yyyy} y no puede ser recepcionado.") { }
}