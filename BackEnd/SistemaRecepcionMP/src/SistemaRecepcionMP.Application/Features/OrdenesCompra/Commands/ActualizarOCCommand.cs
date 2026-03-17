using MediatR;
using SistemaRecepcionMP.Application.Common.Behaviours;
using SistemaRecepcionMP.Domain.Interfaces;
using FluentValidation;

namespace SistemaRecepcionMP.Application.Features.OrdenesCompra.Commands;

public sealed class ActualizarOCCommand : IRequest, IAuditableCommand
{
    public Guid Id { get; set; }
    public DateOnly? FechaEntregaEsperada { get; set; }
    public string? Observaciones { get; set; }

    public string EntidadAfectada => "OrdenCompra";
    public string RegistroId => Id.ToString();
}

public sealed class ActualizarOCCommandValidator : AbstractValidator<ActualizarOCCommand>
{
    public ActualizarOCCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("El ID es obligatorio.");
        RuleFor(x => x.Observaciones)
            .MaximumLength(500).WithMessage("Las observaciones no pueden superar 500 caracteres.")
            .When(x => x.Observaciones is not null);
    }
}

public sealed class ActualizarOCCommandHandler : IRequestHandler<ActualizarOCCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public ActualizarOCCommandHandler(IUnitOfWork unitOfWork)
        => _unitOfWork = unitOfWork;

    public async Task Handle(ActualizarOCCommand request, CancellationToken cancellationToken)
    {
        var oc = await _unitOfWork.OrdenesCompra.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"OC {request.Id} no encontrada.");

        if (oc.Estado == Domain.Enums.EstadoOrdenCompra.Cancelada)
            throw new InvalidOperationException("No se puede editar una OC cancelada.");

        oc.FechaEntregaEsperada = request.FechaEntregaEsperada;
        oc.Observaciones = request.Observaciones?.Trim();

        _unitOfWork.OrdenesCompra.Update(oc);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}