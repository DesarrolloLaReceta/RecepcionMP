using FluentValidation;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.FinalizarRecepcion;

public sealed class FinalizarRecepcionCommandValidator
    : AbstractValidator<FinalizarRecepcionCommand>
{
    public FinalizarRecepcionCommandValidator()
    {
        RuleFor(x => x.RecepcionId)
            .NotEmpty()
            .WithMessage("La recepción es obligatoria.");
    }
}