
using FluentValidation;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.AgregarFactura;

public class AgregarFacturaValidator 
    : AbstractValidator<AgregarFacturaCommand>
{
    public AgregarFacturaValidator()
    {
        RuleFor(x => x.RecepcionId)
            .NotEmpty();

        RuleFor(x => x.NumeroFactura)
            .NotEmpty()
            .MaximumLength(50);

        RuleFor(x => x.FechaFactura)
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow));

        RuleFor(x => x.TotalFactura)
            .GreaterThan(0);
    }
}