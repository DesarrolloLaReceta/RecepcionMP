using FluentValidation;

namespace SistemaRecepcionMP.Application.Features.Calidad.Commands.RegistrarLavadoBotasManos;

public sealed class RegistrarLavadoBotasManosCommandValidator : AbstractValidator<RegistrarLavadoBotasManosCommand>
{
    public RegistrarLavadoBotasManosCommandValidator()
    {
        RuleFor(x => x.Fecha).NotEmpty();
        RuleFor(x => x.Turno).NotEmpty().MaximumLength(40);
        RuleFor(x => x.Piso).NotEmpty().MaximumLength(40);
        RuleFor(x => x.Entrada).NotEmpty().MaximumLength(80);
        RuleFor(x => x.PersonasRevisadas).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Novedades).MaximumLength(2000);
        RuleFor(x => x.Observaciones).MaximumLength(2000);
    }
}

