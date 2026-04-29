using FluentValidation;

namespace SistemaRecepcionMP.Application.Features.Calidad.Commands.RegistrarLiberacionCocina
{
    public class RegistrarLiberacionCocinaCommandValidator : AbstractValidator<RegistrarLiberacionCocinaCommand>
    {
        public RegistrarLiberacionCocinaCommandValidator()
        {
            RuleFor(v => v.Turno)
                .NotEmpty().WithMessage("El turno es obligatorio.");

            RuleFor(v => v.Cocina)
                .NotEmpty().WithMessage("La cocina es obligatoria.");

            RuleFor(v => v.NombreResponsable)
                .NotEmpty().WithMessage("El nombre de quien realiza la liberación es obligatorio.")
                .MaximumLength(150).WithMessage("El nombre no puede exceder los 150 caracteres.");

            RuleFor(v => v.CargoResponsable)
                .NotEmpty().WithMessage("El cargo es obligatorio.");

            // Validamos que la lista de inspección no esté vacía
            RuleFor(v => v.Inspeccion)
                .NotEmpty().WithMessage("Debe completar la tabla de inspección.")
                .Must(x => x.Count > 0).WithMessage("La inspección debe tener al menos un ítem.");

            // Validación para cada ítem dentro de la lista
            RuleForEach(v => v.Inspeccion).ChildRules(item =>
            {
                item.RuleFor(i => i.Estado)
                    .NotEmpty().WithMessage("Todos los ítems deben tener una calificación (Cumple, No cumple o N/A).");
                
                item.RuleFor(i => i.Item)
                    .NotEmpty().WithMessage("El nombre del ítem evaluado es obligatorio.");
            });
        }
    }
}