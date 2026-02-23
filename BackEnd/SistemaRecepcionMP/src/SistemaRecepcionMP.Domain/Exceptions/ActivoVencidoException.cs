namespace SistemaRecepcionMP.Domain.Exceptions;

public sealed class ActivoVencidoException : DomainException
{
    public ActivoVencidoException(string tipoActivo, string identificador, DateOnly fechaVencimiento)
        : base($"El {tipoActivo} '{identificador}' venció el {fechaVencimiento:dd/MM/yyyy} " +
               $"y no puede utilizarse para continuar con la operación.") { }

    public ActivoVencidoException(string tipoActivo, string identificador, DateOnly fechaVencimiento, int diasVencido)
        : base($"El {tipoActivo} '{identificador}' lleva {diasVencido} día(s) vencido " +
               $"desde el {fechaVencimiento:dd/MM/yyyy}. Renueve el documento antes de continuar.") { }
}