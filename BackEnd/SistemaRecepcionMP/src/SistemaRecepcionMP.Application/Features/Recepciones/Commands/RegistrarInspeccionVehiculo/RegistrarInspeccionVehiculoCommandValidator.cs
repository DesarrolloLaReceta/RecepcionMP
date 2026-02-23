using FluentValidation;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.RegistrarInspeccionVehiculo;

public sealed class RegistrarInspeccionVehiculoCommandValidator
    : AbstractValidator<RegistrarInspeccionVehiculoCommand>
{
    public RegistrarInspeccionVehiculoCommandValidator()
    {
        RuleFor(x => x.RecepcionId)
            .NotEmpty().WithMessage("La recepción es obligatoria.");

        RuleFor(x => x.TemperaturaInicial)
            .InclusiveBetween(-40m, 60m)
            .WithMessage("La temperatura inicial debe estar entre -40°C y 60°C.")
            .When(x => x.TemperaturaInicial.HasValue);

        RuleFor(x => x.Observaciones)
            .MaximumLength(500).WithMessage("Las observaciones no pueden superar 500 caracteres.")
            .When(x => x.Observaciones is not null);

        // Si hay plagas visibles o temperatura fuera de rango, observaciones son obligatorias
        RuleFor(x => x.Observaciones)
            .NotEmpty().WithMessage("Las observaciones son obligatorias cuando hay hallazgos críticos " +
                                    "(plagas visibles o temperatura fuera de rango).")
            .When(x => x.PlagasVisible || !x.TemperaturaDentroRango);
    }
}