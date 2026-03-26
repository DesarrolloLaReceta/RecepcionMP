using FluentValidation;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.RegistrarLlegada;

public class RegistrarLlegadaValidator : AbstractValidator<RegistrarLlegadaCommand>
{
    public RegistrarLlegadaValidator()
    {
        RuleFor(x => x.RecepcionId)
            .NotEmpty();

        RuleFor(x => x.PlacaVehiculo)
            .NotEmpty()
            .MaximumLength(10);

        RuleFor(x => x.NombreTransportista)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.FechaRecepcion)
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Now));

        RuleFor(x => x.HoraLlegadaVehiculo)
            .NotEmpty();
    }
}