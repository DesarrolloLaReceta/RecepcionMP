using FluentValidation;

namespace SistemaRecepcionMP.Application.Features.Proveedores.Commands.AgregarDocumentoSanitario;

public sealed class AgregarDocumentoSanitarioCommandValidator
    : AbstractValidator<AgregarDocumentoSanitarioCommand>
{
    private static readonly string[] ExtensionesPermitidas = { ".pdf", ".jpg", ".jpeg", ".png" };
    private const int TamanoMaximoBytes = 10 * 1024 * 1024; // 10 MB

    public AgregarDocumentoSanitarioCommandValidator()
    {
        RuleFor(x => x.ProveedorId)
            .NotEmpty().WithMessage("El ID del proveedor es obligatorio.");

        RuleFor(x => x.NumeroDocumento)
            .NotEmpty().WithMessage("El número de documento es obligatorio.")
            .MaximumLength(100).WithMessage("El número de documento no puede superar 100 caracteres.");

        RuleFor(x => x.FechaExpedicion)
            .NotEmpty().WithMessage("La fecha de expedición es obligatoria.")
            .LessThan(x => x.FechaVencimiento)
            .WithMessage("La fecha de expedición debe ser anterior a la fecha de vencimiento.");

        RuleFor(x => x.FechaVencimiento)
            .NotEmpty().WithMessage("La fecha de vencimiento es obligatoria.")
            .GreaterThan(DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("La fecha de vencimiento debe ser futura.");

        RuleFor(x => x.NombreArchivo)
            .NotEmpty().WithMessage("El nombre del archivo es obligatorio.")
            .Must(nombre => ExtensionesPermitidas
                .Any(ext => nombre.EndsWith(ext, StringComparison.OrdinalIgnoreCase)))
            .WithMessage($"Solo se permiten archivos: {string.Join(", ", ExtensionesPermitidas)}.");

        RuleFor(x => x.ContenidoArchivo)
            .NotEmpty().WithMessage("El archivo es obligatorio.")
            .Must(contenido => contenido.Length <= TamanoMaximoBytes)
            .WithMessage("El archivo no puede superar 10 MB.");
    }
}