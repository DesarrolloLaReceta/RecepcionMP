using FluentValidation;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.AdjuntarDocumento;

public sealed class AdjuntarDocumentoCommandValidator : AbstractValidator<AdjuntarDocumentoCommand>
{
    private static readonly string[] ExtensionesPermitidas = { ".pdf", ".jpg", ".jpeg", ".png" };
    private const int TamanoMaximoBytes = 15 * 1024 * 1024; // 15 MB

    public AdjuntarDocumentoCommandValidator()
    {
        // Debe ir asociado a una recepción o a un lote, no a ninguno ni a ambos
        RuleFor(x => x)
            .Must(x => x.RecepcionId.HasValue || x.LoteRecibidoId.HasValue)
            .WithMessage("El documento debe estar asociado a una recepción o a un lote.")
            .OverridePropertyName("Asociacion");

        RuleFor(x => x)
            .Must(x => !(x.RecepcionId.HasValue && x.LoteRecibidoId.HasValue))
            .WithMessage("El documento no puede estar asociado a una recepción y a un lote al mismo tiempo.")
            .OverridePropertyName("Asociacion");

        RuleFor(x => x.TipoDocumento)
            .IsInEnum().WithMessage("El tipo de documento no es válido.");

        RuleFor(x => x.NombreArchivo)
            .NotEmpty().WithMessage("El nombre del archivo es obligatorio.")
            .Must(nombre => ExtensionesPermitidas
                .Any(ext => nombre.EndsWith(ext, StringComparison.OrdinalIgnoreCase)))
            .WithMessage($"Solo se permiten archivos: {string.Join(", ", ExtensionesPermitidas)}.");

        RuleFor(x => x.ContenidoArchivo)
            .NotEmpty().WithMessage("El archivo es obligatorio.")
            .Must(c => c.Length <= TamanoMaximoBytes)
            .WithMessage("El archivo no puede superar 15 MB.");
    }
}