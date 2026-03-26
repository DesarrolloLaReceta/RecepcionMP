using MediatR;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Exceptions;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.AgregarLoteAItem;

public class AgregarLoteAItemHandler 
    : IRequestHandler<AgregarLoteAItemCommand, Guid>
{
    private readonly IRecepcionRepository _recepcionRepository;

    public AgregarLoteAItemHandler(IRecepcionRepository recepcionRepository)
    {
        _recepcionRepository = recepcionRepository;
    }

    public async Task<Guid> Handle(
        AgregarLoteAItemCommand request, 
        CancellationToken cancellationToken)
    {
        var recepcion = await _recepcionRepository
            .GetWithItemsAndLotesAsync(request.RecepcionId);

        if (recepcion is null)
            throw new NotFoundException("Recepcion", request.RecepcionId);

        var lote = new LoteRecibido(
            request.ItemId,
            request.NumeroLoteProveedor,
            request.FechaFabricacion,
            request.FechaVencimiento,
            request.CantidadRecibida,
            request.CantidadRechazada,
            request.UnidadMedida,
            request.TemperaturaMedida,
            request.EstadoSensorial,
            request.EstadoRotulado,
            request.UbicacionDestino
        );

        recepcion.AgregarLoteAItem(request.ItemId, lote);

        await _recepcionRepository.UpdateAsync(recepcion);

        return lote.Id;
    }
}