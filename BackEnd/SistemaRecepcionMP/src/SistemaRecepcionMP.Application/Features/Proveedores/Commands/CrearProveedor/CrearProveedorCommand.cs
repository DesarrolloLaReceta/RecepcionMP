using SistemaRecepcionMP.Application.Common.Behaviours;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Proveedores.Commands.CrearProveedor;

public sealed class CrearProveedorCommand : IRequest<Guid>, IAuditableCommand
{
    public string RazonSocial { get; set; } = string.Empty;
    public string Nit { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string? EmailContacto { get; set; }
    public string? Direccion { get; set; }

    // IAuditableCommand
    public string EntidadAfectada => "Proveedor";
    public string RegistroId => Nit;
}