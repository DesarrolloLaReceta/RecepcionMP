using SistemaRecepcionMP.Application.Common.Exceptions;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Exceptions.OrdenesCompra;
using SistemaRecepcionMP.Domain.Interfaces;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.OrdenesCompra.Commands.ActualizarEstadoOC;

public sealed class ActualizarEstadoOCCommandHandler : IRequestHandler<ActualizarEstadoOCCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    // Transiciones de estado permitidas por negocio
    private static readonly Dictionary<EstadoOrdenCompra, List<EstadoOrdenCompra>> TransicionesValidas = new()
    {
        { EstadoOrdenCompra.Abierta,               new() { EstadoOrdenCompra.Cancelada } },
        { EstadoOrdenCompra.ParcialmenteRecibida,   new() { EstadoOrdenCompra.Cancelada } },
        { EstadoOrdenCompra.CompletamenteRecibida,  new() { } },
        { EstadoOrdenCompra.Cancelada,              new() { } }
    };

    public ActualizarEstadoOCCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(
        ActualizarEstadoOCCommand request,
        CancellationToken cancellationToken)
    {
        var oc = await _unitOfWork.OrdenesCompra.GetByIdAsync(request.Id)
            ?? throw new OrdenCompraNotFoundException(request.Id);

        // Verificar que la transición de estado es válida
        var transicionesPermitidas = TransicionesValidas[oc.Estado];
        if (!transicionesPermitidas.Contains(request.NuevoEstado))
            throw new ValidationException("NuevoEstado",
                $"No se puede cambiar el estado de '{oc.Estado}' a '{request.NuevoEstado}'. " +
                $"Transiciones permitidas: {(transicionesPermitidas.Any() ? string.Join(", ", transicionesPermitidas) : "ninguna")}.");

        oc.Estado = request.NuevoEstado;

        _unitOfWork.OrdenesCompra.Update(oc);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}