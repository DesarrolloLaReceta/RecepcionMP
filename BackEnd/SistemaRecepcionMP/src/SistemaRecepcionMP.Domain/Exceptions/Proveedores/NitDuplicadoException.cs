namespace SistemaRecepcionMP.Domain.Exceptions.Proveedores;

public sealed class NitDuplicadoException : DomainException
{
    public NitDuplicadoException(string nit)
        : base($"Ya existe un proveedor registrado con el NIT '{nit}'.") { }
}