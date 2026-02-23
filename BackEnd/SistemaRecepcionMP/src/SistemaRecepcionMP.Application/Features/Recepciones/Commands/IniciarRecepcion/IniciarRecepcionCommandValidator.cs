using FluentValidation;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.IniciarRecepcion;

public sealed class IniciarRecepcionCommandValidator : AbstractValidator<IniciarRecepcionCommand>
{
    public IniciarRecepcionCommandValidator()
    {
        RuleFor(x => x.OrdenCompraId)
            .NotEmpty().WithMessage("La orden de compra es obligatoria.");

        RuleFor(x => x.FechaRecepcion)
            .NotEmpty().WithMessage("La fecha de recepción es obligatoria.")
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("La fecha de recepción no puede ser futura.");

        RuleFor(x => x.HoraLlegadaVehiculo)
            .NotEmpty().WithMessage("La hora de llegada del vehículo es obligatoria.");

        RuleFor(x => x.PlacaVehiculo)
            .MaximumLength(10).WithMessage("La placa no puede superar 10 caracteres.")
            .Matches(@"^[A-Za-z0-9\-]+$").WithMessage("La placa solo puede contener letras, números y guiones.")
            .When(x => x.PlacaVehiculo is not null);

        RuleFor(x => x.NombreTransportista)
            .MaximumLength(150).WithMessage("El nombre del transportista no puede superar 150 caracteres.")
            .When(x => x.NombreTransportista is not null);

        RuleFor(x => x.ObservacionesGenerales)
            .MaximumLength(500).WithMessage("Las observaciones no pueden superar 500 caracteres.")
            .When(x => x.ObservacionesGenerales is not null);
    }
}