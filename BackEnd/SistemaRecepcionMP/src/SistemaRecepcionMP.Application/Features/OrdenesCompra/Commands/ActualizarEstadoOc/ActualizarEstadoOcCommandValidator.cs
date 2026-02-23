using SistemaRecepcionMP.Domain.Enums;
using FluentValidation;

namespace SistemaRecepcionMP.Application.Features.OrdenesCompra.Commands.ActualizarEstadoOC;

public sealed class ActualizarEstadoOCCommandValidator : AbstractValidator<ActualizarEstadoOCCommand>
{
    // Transiciones válidas de estado
    private static readonly Dictionary<EstadoOrdenCompra, List<EstadoOrdenCompra>> TransicionesValidas = new()
    {
        { EstadoOrdenCompra.Abierta, new() { EstadoOrdenCompra.Cancelada } },
        { EstadoOrdenCompra.ParcialmenteRecibida, new() { EstadoOrdenCompra.Cancelada } },
        { EstadoOrdenCompra.CompletamenteRecibida, new() { } },
        { EstadoOrdenCompra.Cancelada, new() { } }
    };

    public ActualizarEstadoOCCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("El ID de la orden de compra es obligatorio.");

        RuleFor(x => x.NuevoEstado)
            .IsInEnum().WithMessage("El estado indicado no es válido.");

        RuleFor(x => x.Motivo)
            .NotEmpty().WithMessage("El motivo es obligatorio al cancelar una OC.")
            .MaximumLength(500).WithMessage("El motivo no puede superar 500 caracteres.")
            .When(x => x.NuevoEstado == EstadoOrdenCompra.Cancelada);
    }
}