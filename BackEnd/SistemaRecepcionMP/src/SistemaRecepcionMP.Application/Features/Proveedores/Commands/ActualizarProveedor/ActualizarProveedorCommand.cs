using SistemaRecepcionMP.Application.Common.Behaviours;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Proveedores.Commands.ActualizarProveedor;

public sealed class ActualizarProveedorCommand : IRequest, IAuditableCommand
{
    public Guid Id { get; set; }
    public string RazonSocial { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public string? EmailContacto { get; set; }
    public string? Direccion { get; set; }
    public bool Estado { get; set; }

    // IAuditableCommand
    public string EntidadAfectada => "Proveedor";
    public string RegistroId => Id.ToString();
}