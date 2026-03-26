using MediatR;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Exceptions;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;


namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.AgregarItemRecepcion;

public class AgregarItemRecepcionHandler 
    : IRequestHandler<AgregarItemRecepcionCommand, Unit>
{
    private readonly IRecepcionRepository _recepcionRepository;
    private readonly IOrdenCompraRepository _ordenCompraRepository;

    public AgregarItemRecepcionHandler(
        IRecepcionRepository recepcionRepository,
        IOrdenCompraRepository ordenCompraRepository)
    {
        _recepcionRepository = recepcionRepository;
        _ordenCompraRepository = ordenCompraRepository;
    }

    public async Task<Unit> Handle(
        AgregarItemRecepcionCommand request,
        CancellationToken cancellationToken)
    {
        var recepcion = await _recepcionRepository
            .GetWithItemsAndLotesAsync(request.RecepcionId);

        if (recepcion is null)
            throw new NotFoundException("Recepcion", request.RecepcionId);

        var ordenCompra = await _ordenCompraRepository
            .GetByIdAsync(recepcion.OrdenCompraId);

        if (ordenCompra is null)
            throw new BusinessRuleException("Orden de compra no encontrada");

        var detalle = ordenCompra.Detalles
            .FirstOrDefault(x => x.Id == request.DetalleOrdenCompraId);

        if (detalle is null)
            throw new BusinessRuleException("El detalle no pertenece a la orden de compra");

        var item = new RecepcionItem(
            recepcion.Id,
            detalle.Id,
            detalle.CantidadSolicitada,
            detalle.UnidadMedida
        );

        recepcion.AgregarItem(item);

        await _recepcionRepository.UpdateAsync(recepcion);

        return Unit.Value;
    }
}