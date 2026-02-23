using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Domain.Exceptions.Proveedores;

public sealed class ProveedorNoHabilitadoException : DomainException
{
    public ProveedorNoHabilitadoException(string razonSocial)
        : base($"El proveedor '{razonSocial}' no está habilitado para recepcionar materia prima. " +
               $"Verifique que sus documentos sanitarios estén vigentes.") { }

    public ProveedorNoHabilitadoException(string razonSocial, IEnumerable<TipoDocumento> documentosVencidos)
        : base($"El proveedor '{razonSocial}' tiene los siguientes documentos vencidos o faltantes: " +
               $"{string.Join(", ", documentosVencidos)}. " +
               $"No es posible iniciar una recepción hasta que sean renovados.") { }

    public ProveedorNoHabilitadoException(string razonSocial, string motivoEspecifico)
        : base($"El proveedor '{razonSocial}' no está habilitado: {motivoEspecifico}.") { }
}