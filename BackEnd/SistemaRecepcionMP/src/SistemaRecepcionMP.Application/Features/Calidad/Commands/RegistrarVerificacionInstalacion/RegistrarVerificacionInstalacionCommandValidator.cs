using FluentValidation;

namespace SistemaRecepcionMP.Application.Features.Calidad.Commands.RegistrarVerificacionInstalacion;

public sealed class RegistrarVerificacionInstalacionCommandValidator : AbstractValidator<RegistrarVerificacionInstalacionCommand>
{
    public RegistrarVerificacionInstalacionCommandValidator()
    {
        RuleFor(x => x.Zona)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.CumplimientoTotal)
            .InclusiveBetween(0, 100);

        RuleFor(x => x.Detalles)
            .NotEmpty();

        RuleForEach(x => x.Detalles).ChildRules(detalle =>
        {
            detalle.RuleFor(d => d.AspectoId).NotEmpty().MaximumLength(80);
            detalle.RuleFor(d => d.AspectoNombre).NotEmpty().MaximumLength(250);
            detalle.RuleFor(d => d.Calificacion).InclusiveBetween((short)1, (short)2);
            detalle.RuleFor(d => d.Hallazgo).MaximumLength(1200);
            detalle.RuleFor(d => d.PlanAccion).MaximumLength(1200);
            detalle.RuleFor(d => d.Responsable).MaximumLength(200);
        });
    }
}

