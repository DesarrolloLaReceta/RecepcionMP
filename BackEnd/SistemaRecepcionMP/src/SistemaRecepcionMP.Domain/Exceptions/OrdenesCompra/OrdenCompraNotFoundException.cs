namespace SistemaRecepcionMP.Domain.Exceptions.OrdenesCompra;

public sealed class OrdenCompraNotFoundException : DomainException
{
    public OrdenCompraNotFoundException(Guid id)
        : base($"No se encontró la orden de compra con ID '{id}'.") { }

    public OrdenCompraNotFoundException(string numeroOC)
        : base($"No se encontró la orden de compra con número '{numeroOC}'.") { }
}