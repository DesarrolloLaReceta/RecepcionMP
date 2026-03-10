using FluentValidation;

namespace SistemaRecepcionMP.Application.Features.Proveedores.Commands.CrearProveedor;

public sealed class CrearProveedorCommandValidator : AbstractValidator<CrearProveedorCommand>
{
    public CrearProveedorCommandValidator()
    {
        RuleFor(x => x.RazonSocial)
            .NotEmpty().WithMessage("La razón social es obligatoria.")
            .MaximumLength(200).WithMessage("La razón social no puede superar 200 caracteres.");

        RuleFor(x => x.Nit)
            .NotEmpty().WithMessage("El NIT es obligatorio.")
            .MaximumLength(20).WithMessage("El NIT no puede superar 20 caracteres.")
            .Matches(@"^\d{7,10}-\d{1}$")
            .WithMessage("El NIT debe tener el formato válido colombiano (ej: 900123456-7).");

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

        // Validaciones para el contacto principal
        RuleFor(x => x.NombreContacto)
            .NotEmpty().WithMessage("El nombre del contacto es obligatorio cuando se proporciona información de contacto.")
            .MaximumLength(100).WithMessage("El nombre del contacto no puede superar 100 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.NombreContacto) || 
                      !string.IsNullOrWhiteSpace(x.CargoContacto) || 
                      !string.IsNullOrWhiteSpace(x.TelefonoContacto) || 
                      !string.IsNullOrWhiteSpace(x.EmailContactoProveedor));

        RuleFor(x => x.CargoContacto)
            .MaximumLength(100).WithMessage("El cargo no puede superar 100 caracteres.")
            .When(x => x.CargoContacto is not null);

        RuleFor(x => x.TelefonoContacto)
            .MaximumLength(20).WithMessage("El teléfono del contacto no puede superar 20 caracteres.")
            .When(x => x.TelefonoContacto is not null);

        RuleFor(x => x.EmailContactoProveedor)
            .EmailAddress().WithMessage("El correo electrónico del contacto no tiene un formato válido.")
            .MaximumLength(150).WithMessage("El correo del contacto no puede superar 150 caracteres.")
            .When(x => x.EmailContactoProveedor is not null);
    }
}
