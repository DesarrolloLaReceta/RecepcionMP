namespace SistemaRecepcionMP.Domain.Exceptions.Calidad;

public sealed class NoConformidadNoSolucionadaException : DomainException
{
    public NoConformidadNoSolucionadaException(string codigoLote, int totalAbiertas)
        : base($"No se puede liberar el lote '{codigoLote}' porque tiene {totalAbiertas} " +
               $"no conformidad(es) sin solucionar. Cierre todas las no conformidades antes de liberar.") { }

    public NoConformidadNoSolucionadaException(string codigoLote, IEnumerable<string> descripcionesAbiertas)
        : base($"No se puede liberar el lote '{codigoLote}'. " +
               $"Las siguientes no conformidades permanecen abiertas: " +
               $"{string.Join(" | ", descripcionesAbiertas)}.") { }
}