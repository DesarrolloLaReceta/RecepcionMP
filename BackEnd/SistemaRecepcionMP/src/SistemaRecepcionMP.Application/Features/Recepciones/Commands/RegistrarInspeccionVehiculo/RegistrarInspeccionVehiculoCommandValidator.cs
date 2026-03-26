using FluentValidation;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.RegistrarInspeccionVehiculo;

public class RegistrarInspeccionVehiculoValidator 
    : AbstractValidator<RegistrarInspeccionVehiculoCommand>
{
    public RegistrarInspeccionVehiculoValidator()
    {
        RuleFor(x => x.RecepcionId)
            .NotEmpty();

        RuleFor(x => x.TemperaturaInicial)
            .GreaterThanOrEqualTo(-50)
            .LessThanOrEqualTo(100)
            .When(x => x.TemperaturaInicial.HasValue);

        RuleFor(x => x.Observaciones)
            .MaximumLength(500);

        RuleFor(x => x)
            .Must(x => x.TemperaturaDentroRango || x.TemperaturaInicial.HasValue)
            .WithMessage("Debe indicar la temperatura si está fuera de rango.");
    }
}