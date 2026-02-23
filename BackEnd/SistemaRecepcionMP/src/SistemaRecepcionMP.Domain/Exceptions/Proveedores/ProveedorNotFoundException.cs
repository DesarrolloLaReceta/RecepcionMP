namespace SistemaRecepcionMP.Domain.Exceptions.Proveedores;

public sealed class ProveedorNotFoundException : DomainException
{
    public ProveedorNotFoundException(Guid id)
        : base($"No se encontró el proveedor con ID '{id}'.") { }

    public ProveedorNotFoundException(string nit)
        : base($"No se encontró el proveedor con NIT '{nit}'.") { }
}