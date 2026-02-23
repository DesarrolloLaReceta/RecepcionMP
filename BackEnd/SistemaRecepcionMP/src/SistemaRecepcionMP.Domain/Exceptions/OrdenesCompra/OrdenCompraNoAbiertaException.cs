using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Domain.Exceptions.OrdenesCompra;

public sealed class OrdenCompraNoAbiertaException : DomainException
{
    public OrdenCompraNoAbiertaException(string numeroOC, EstadoOrdenCompra estadoActual)
        : base($"No se puede iniciar una recepción sobre la orden de compra '{numeroOC}' " +
               $"porque su estado actual es '{estadoActual}'. Solo se permiten recepciones sobre órdenes abiertas o parcialmente recibidas.") { }
}