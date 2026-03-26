
using FluentValidation;
using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.EvaluarCalidad;

public class EvaluarCalidadValidator 
    : AbstractValidator<EvaluarCalidadCommand>
{
    public EvaluarCalidadValidator()
    {
        RuleFor(x => x.RecepcionId)
            .NotEmpty();

        RuleFor(x => x.LoteId)
            .NotEmpty();

        RuleFor(x => x.EstadoCalidad)
            .IsInEnum();

        When(x => x.EstadoCalidad == EstadoCalidad.AprobadoCondicional, () =>
        {
            RuleFor(x => x.CantidadRechazada)
                .NotNull()
                .GreaterThan(0);
        });

        When(x => x.CantidadRechazada.HasValue, () =>
        {
            RuleFor(x => x.CantidadRechazada.Value)
                .GreaterThanOrEqualTo(0);
        });
    }
}