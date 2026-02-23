using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Domain.Exceptions.Documentos;

public sealed class DocumentoObligatorioFaltanteException : DomainException
{
    public DocumentoObligatorioFaltanteException(string numeroRecepcion, TipoDocumento tipoDocumento)
        : base($"No se puede cerrar la recepción '{numeroRecepcion}' porque falta adjuntar el documento obligatorio: '{tipoDocumento}'. " +
               $"Este documento es exigido por la categoría del ítem recepcionado.") { }

    public DocumentoObligatorioFaltanteException(string numeroRecepcion, IEnumerable<TipoDocumento> tiposFaltantes)
        : base($"No se puede cerrar la recepción '{numeroRecepcion}' porque faltan los siguientes documentos obligatorios: " +
               $"{string.Join(", ", tiposFaltantes)}.") { }
}