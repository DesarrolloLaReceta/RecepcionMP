using FluentValidation;
using SistemaRecepcionMP.Application.Features.Proveedores.Commands.ActualizarProveedor;

namespace SistemaRecepcionMP.Application.Features.Proveedores.Commands.ActualizarProveedor;

public sealed class ActualizarProveedorCommandValidator : AbstractValidator<ActualizarProveedorCommand>
{
    public ActualizarProveedorCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("El ID del proveedor es obligatorio.");

        RuleFor(x => x.RazonSocial)
            .NotEmpty().WithMessage("La razón social es obligatoria.")
            .MaximumLength(200).WithMessage("La razón social no puede superar 200 caracteres.");

        RuleFor(x => x.Telefono)
            .MaximumLength(20).WithMessage("El teléfono no puede superar 20 caracteres.")
            .When(x => x.Telefono is not null);

        RuleFor(x => x.EmailContacto)
            .EmailAddress().WithMessage("El correo electrónico no tiene un formato válido.")
            .MaximumLength(150).WithMessage("El correo no puede superar 150 caracteres.")
            .When(x => x.EmailContacto is not null);

        RuleFor(x => x.Direccion)
            .MaximumLength(300).WithMessage("La dirección no puede superar 300 caracteres.")
            .When(x => x.Direccion is not null);
            
        RuleFor(x => x.Estado)
            .IsInEnum().WithMessage("El estado proporcionado no es válido. Los valores permitidos son: Activo, Inactivo, Suspendido.")
            .When(x => x.Estado.HasValue);
    }
}