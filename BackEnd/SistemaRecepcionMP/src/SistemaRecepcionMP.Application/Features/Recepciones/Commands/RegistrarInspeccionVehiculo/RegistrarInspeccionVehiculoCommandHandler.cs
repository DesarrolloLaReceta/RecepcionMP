using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Exceptions.Recepciones;
using SistemaRecepcionMP.Domain.Interfaces;
using MediatR;
using SistemaRecepcionMP.Domain.Exceptions;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.RegistrarInspeccionVehiculo;

public class RegistrarInspeccionVehiculoHandler 
    : IRequestHandler<RegistrarInspeccionVehiculoCommand, Unit>
{
    private readonly IRecepcionRepository _recepcionRepository;

    public RegistrarInspeccionVehiculoHandler(IRecepcionRepository recepcionRepository)
    {
        _recepcionRepository = recepcionRepository;
    }

    public async Task<Unit> Handle(
        RegistrarInspeccionVehiculoCommand request,
        CancellationToken cancellationToken)
    {
        var recepcion = await _recepcionRepository
            .GetByIdAsync(request.RecepcionId);

        if (recepcion is null)
            throw new NotFoundException("Recepcion", request.RecepcionId);

        recepcion.RegistrarInspeccionVehiculo(
            request.TemperaturaInicial,
            request.TemperaturaDentroRango,
            request.IntegridadEmpaque,
            request.LimpiezaVehiculo,
            request.PresenciaOloresExtranos,
            request.PlagasVisible,
            request.DocumentosTransporteOk,
            request.Observaciones
        );

        await _recepcionRepository.UpdateAsync(recepcion);

        return Unit.Value;
    }
}