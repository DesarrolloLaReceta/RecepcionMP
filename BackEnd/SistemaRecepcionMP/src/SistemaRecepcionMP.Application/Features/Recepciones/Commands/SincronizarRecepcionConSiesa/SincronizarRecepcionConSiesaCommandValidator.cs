using FluentValidation;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.SincronizarRecepcionConSiesa;

public sealed class SincronizarRecepcionConSiesaCommandValidator
    : AbstractValidator<SincronizarRecepcionConSiesaCommand>
{
    public SincronizarRecepcionConSiesaCommandValidator()
    {
        RuleFor(x => x.RecepcionId).NotEmpty();
    }
}
