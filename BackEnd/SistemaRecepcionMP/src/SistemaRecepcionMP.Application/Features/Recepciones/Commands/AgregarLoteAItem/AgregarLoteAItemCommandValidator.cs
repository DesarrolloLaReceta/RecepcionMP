using FluentValidation;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.AgregarLoteAItem;

public sealed class AgregarLoteAItemCommandValidator
    : AbstractValidator<AgregarLoteAItemCommand>
{
    public AgregarLoteAItemCommandValidator()
    {
        RuleFor(x => x.RecepcionId)
            .NotEmpty().WithMessage("La recepción es obligatoria.");

        RuleFor(x => x.DetalleOcId)
            .NotEmpty().WithMessage("El detalle de la orden de compra es obligatorio.");

        RuleFor(x => x.ItemId)
            .NotEmpty().WithMessage("El ítem es obligatorio.");

        RuleFor(x => x.NumeroLoteProveedor)
            .MaximumLength(100).WithMessage("El número de lote del proveedor no puede superar 100 caracteres.")
            .When(x => x.NumeroLoteProveedor is not null);

        RuleFor(x => x.FechaFabricacion)
            .LessThan(x => x.FechaVencimiento)
            .WithMessage("La fecha de fabricación debe ser anterior a la fecha de vencimiento.")
            .When(x => x.FechaFabricacion.HasValue);

        RuleFor(x => x.FechaVencimiento)
            .NotEmpty().WithMessage("La fecha de vencimiento es obligatoria.")
            .GreaterThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("La fecha de vencimiento no puede ser anterior a hoy.");

        RuleFor(x => x.CantidadRecibida)
            .GreaterThan(0).WithMessage("La cantidad recibida debe ser mayor a 0.");

        RuleFor(x => x.UnidadMedida)
            .NotEmpty().WithMessage("La unidad de medida es obligatoria.")
            .MaximumLength(20).WithMessage("La unidad de medida no puede superar 20 caracteres.");

        RuleFor(x => x.TemperaturaMedida)
            .InclusiveBetween(-40m, 60m)
            .WithMessage("La temperatura medida debe estar entre -40°C y 60°C.")
            .When(x => x.TemperaturaMedida.HasValue);

        RuleFor(x => x.EstadoSensorial)
            .IsInEnum().WithMessage("El estado sensorial no es válido.");

        RuleFor(x => x.EstadoRotulado)
            .IsInEnum().WithMessage("El estado de rotulado no es válido.");
    }
}