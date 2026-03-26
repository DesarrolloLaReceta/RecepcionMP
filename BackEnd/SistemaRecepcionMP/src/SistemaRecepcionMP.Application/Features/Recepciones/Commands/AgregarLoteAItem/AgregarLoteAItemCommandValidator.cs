using FluentValidation;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.AgregarLoteAItem;

public class AgregarLoteAItemValidator 
    : AbstractValidator<AgregarLoteAItemCommand>
{
    public AgregarLoteAItemValidator()
    {
        RuleFor(x => x.RecepcionId)
            .NotEmpty();

        RuleFor(x => x.ItemId)
            .NotEmpty();

        RuleFor(x => x.CantidadRecibida)
            .GreaterThan(0);

        RuleFor(x => x.CantidadRechazada)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x)
            .Must(x => x.CantidadRechazada <= x.CantidadRecibida)
            .WithMessage("No puedes rechazar más de lo recibido");

        RuleFor(x => x.FechaVencimiento)
            .GreaterThan(DateOnly.FromDateTime(DateTime.UtcNow.Date))
            .WithMessage("El lote no puede estar vencido");

        RuleFor(x => x.UnidadMedida)
            .NotEmpty()
            .MaximumLength(20);

        RuleFor(x => x.EstadoSensorial)
            .IsInEnum();

        RuleFor(x => x.EstadoRotulado)
            .IsInEnum();
    }
}