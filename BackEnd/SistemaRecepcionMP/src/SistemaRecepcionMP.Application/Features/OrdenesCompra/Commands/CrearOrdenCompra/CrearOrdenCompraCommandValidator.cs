using FluentValidation;

namespace SistemaRecepcionMP.Application.Features.OrdenesCompra.Commands.CrearOrdenCompra;

public sealed class CrearOrdenCompraCommandValidator : AbstractValidator<CrearOrdenCompraCommand>
{
    public CrearOrdenCompraCommandValidator()
    {
        RuleFor(x => x.NumeroOC)
            .NotEmpty().WithMessage("El número de orden de compra es obligatorio.")
            .MaximumLength(50).WithMessage("El número de OC no puede superar 50 caracteres.");

        RuleFor(x => x.ProveedorId)
            .NotEmpty().WithMessage("El proveedor es obligatorio.");

        RuleFor(x => x.FechaEmision)
            .NotEmpty().WithMessage("La fecha de emisión es obligatoria.")
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("La fecha de emisión no puede ser futura.");

        RuleFor(x => x.FechaEntregaEsperada)
            .GreaterThan(x => x.FechaEmision)
            .WithMessage("La fecha de entrega esperada debe ser posterior a la fecha de emisión.")
            .When(x => x.FechaEntregaEsperada.HasValue);

        RuleFor(x => x.Observaciones)
            .MaximumLength(500).WithMessage("Las observaciones no pueden superar 500 caracteres.")
            .When(x => x.Observaciones is not null);

        RuleFor(x => x.Detalles)
            .NotEmpty().WithMessage("La orden de compra debe tener al menos un ítem.")
            .Must(detalles => detalles.Select(d => d.ItemId).Distinct().Count() == detalles.Count)
            .WithMessage("No se puede repetir el mismo ítem en la orden de compra.");

        RuleForEach(x => x.Detalles).SetValidator(new DetalleOrdenCompraRequestValidator());
    }
}

public sealed class DetalleOrdenCompraRequestValidator : AbstractValidator<DetalleOrdenCompraRequest>
{
    public DetalleOrdenCompraRequestValidator()
    {
        RuleFor(x => x.ItemId)
            .NotEmpty().WithMessage("El ítem es obligatorio.");

        RuleFor(x => x.CantidadSolicitada)
            .GreaterThan(0).WithMessage("La cantidad solicitada debe ser mayor a 0.");

        RuleFor(x => x.UnidadMedida)
            .NotEmpty().WithMessage("La unidad de medida es obligatoria.")
            .MaximumLength(20).WithMessage("La unidad de medida no puede superar 20 caracteres.");

        RuleFor(x => x.PrecioUnitario)
            .GreaterThanOrEqualTo(0).WithMessage("El precio unitario no puede ser negativo.");
    }
}