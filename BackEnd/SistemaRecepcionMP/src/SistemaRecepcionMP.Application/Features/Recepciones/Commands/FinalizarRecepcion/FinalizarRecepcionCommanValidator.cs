using FluentValidation;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.FinalizarRecepcion;

public class FinalizarRecepcionValidator 
    : AbstractValidator<FinalizarRecepcionCommand>
{
    public FinalizarRecepcionValidator()
    {
        RuleFor(x => x.RecepcionId)
            .NotEmpty();
    }
}