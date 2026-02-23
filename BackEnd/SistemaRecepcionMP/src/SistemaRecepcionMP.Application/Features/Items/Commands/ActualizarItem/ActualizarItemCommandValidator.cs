using FluentValidation;

namespace SistemaRecepcionMP.Application.Features.Items.Commands.ActualizarItem;

public sealed class ActualizarItemCommandValidator : AbstractValidator<ActualizarItemCommand>
{
    public ActualizarItemCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("El ID del ítem es obligatorio.");

        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre del ítem es obligatorio.")
            .MaximumLength(200).WithMessage("El nombre no puede superar 200 caracteres.");

        RuleFor(x => x.Descripcion)
            .MaximumLength(500).WithMessage("La descripción no puede superar 500 caracteres.")
            .When(x => x.Descripcion is not null);

        RuleFor(x => x.UnidadMedida)
            .NotEmpty().WithMessage("La unidad de medida es obligatoria.")
            .MaximumLength(20).WithMessage("La unidad de medida no puede superar 20 caracteres.");

        RuleFor(x => x.VidaUtilDias)
            .GreaterThan(0).WithMessage("La vida útil debe ser mayor a 0 días.");

        RuleFor(x => x.TemperaturaMinima)
            .InclusiveBetween(-40m, 60m)
            .WithMessage("La temperatura mínima debe estar entre -40°C y 60°C.")
            .When(x => x.TemperaturaMinima.HasValue);

        RuleFor(x => x.TemperaturaMaxima)
            .InclusiveBetween(-40m, 60m)
            .WithMessage("La temperatura máxima debe estar entre -40°C y 60°C.")
            .When(x => x.TemperaturaMaxima.HasValue);

        // Regla cruzada: si se define una, se deben definir ambas y mínima < máxima
        RuleFor(x => x)
            .Must(x => x.TemperaturaMinima.HasValue && x.TemperaturaMaxima.HasValue)
            .WithMessage("Debe indicar tanto la temperatura mínima como la máxima.")
            .When(x => x.TemperaturaMinima.HasValue || x.TemperaturaMaxima.HasValue)
            .OverridePropertyName("TemperaturaRango");

        RuleFor(x => x)
            .Must(x => x.TemperaturaMinima < x.TemperaturaMaxima)
            .WithMessage("La temperatura mínima debe ser menor que la máxima.")
            .When(x => x.TemperaturaMinima.HasValue && x.TemperaturaMaxima.HasValue)
            .OverridePropertyName("TemperaturaRango");
    }
}