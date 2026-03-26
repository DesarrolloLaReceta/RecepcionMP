using MediatR;
using SistemaRecepcionMP.Domain.Exceptions;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.RegistrarLlegada;

public class RegistrarLlegadaHandler : IRequestHandler<RegistrarLlegadaCommand, Unit>
{
    private readonly IRecepcionRepository _recepcionRepository;

    public RegistrarLlegadaHandler(IRecepcionRepository recepcionRepository)
    {
        _recepcionRepository = recepcionRepository;
    }

    public async Task<Unit> Handle(RegistrarLlegadaCommand request, CancellationToken cancellationToken)
    {
        var recepcion = await _recepcionRepository.GetByIdAsync(request.RecepcionId);

        if (recepcion is null)
            throw new NotFoundException("Recepcion", request.RecepcionId);

        // 🔥 Aquí ocurre la magia real
        recepcion.RegistrarLlegada(
            request.FechaRecepcion,
            request.HoraLlegadaVehiculo,
            request.PlacaVehiculo,
            request.NombreTransportista
        );

        await _recepcionRepository.UpdateAsync(recepcion);

        return Unit.Value;
    }
}