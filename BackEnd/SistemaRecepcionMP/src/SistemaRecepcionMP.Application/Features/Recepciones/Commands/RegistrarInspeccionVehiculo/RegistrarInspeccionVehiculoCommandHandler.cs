using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Exceptions.Recepciones;
using SistemaRecepcionMP.Domain.Interfaces;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.RegistrarInspeccionVehiculo;

public sealed class RegistrarInspeccionVehiculoCommandHandler
    : IRequestHandler<RegistrarInspeccionVehiculoCommand>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public RegistrarInspeccionVehiculoCommandHandler(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task Handle(
        RegistrarInspeccionVehiculoCommand request,
        CancellationToken cancellationToken)
    {
        var recepcion = await _unitOfWork.Recepciones.GetByIdAsync(request.RecepcionId)
            ?? throw new RecepcionNotFoundException(request.RecepcionId);

        if (recepcion.Estado != EstadoRecepcion.Iniciada)
            throw new RecepcionEstadoInvalidoException(
                recepcion.NumeroRecepcion,
                recepcion.Estado,
                "registrar inspección de vehículo");

        if (recepcion.InspeccionVehiculo is not null)
            throw new RecepcionEstadoInvalidoException(
                recepcion.NumeroRecepcion,
                recepcion.Estado,
                "registrar inspección — ya existe una inspección para esta recepción");

        // Determinar resultado automático según los criterios
        var resultado = DeterminarResultado(request);

        var inspeccion = new InspeccionVehiculo
        {
            RecepcionId = recepcion.Id,
            TemperaturaInicial = request.TemperaturaInicial,
            TemperaturaDentroRango = request.TemperaturaDentroRango,
            IntegridadEmpaque = request.IntegridadEmpaque,
            LimpiezaVehiculo = request.LimpiezaVehiculo,
            PresenciaOloresExtranos = request.PresenciaOloresExtranos,
            PlagasVisible = request.PlagasVisible,
            DocumentosTransporteOk = request.DocumentosTransporteOk,
            Resultado = resultado,
            Observaciones = request.Observaciones?.Trim(),
            RegistradoPor = _currentUser.UserId,
            FechaRegistro = DateTime.UtcNow
        };

        // Avanzar estado de la recepción
        inspeccion.RecepcionId = recepcion.Id;
        await _unitOfWork.Recepciones.AddInspeccionVehiculoAsync(inspeccion);

        recepcion.Estado = resultado == ResultadoInspeccion.Aprobado
            ? EstadoRecepcion.InspeccionVehiculo
            : EstadoRecepcion.Rechazada;
        recepcion.ActualizadoEn = DateTime.UtcNow;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static ResultadoInspeccion DeterminarResultado(RegistrarInspeccionVehiculoCommand request)
    {
        // Criterios de rechazo automático según BPM
        var hayFallaCritica =
            request.PlagasVisible ||
            !request.TemperaturaDentroRango ||
            !request.IntegridadEmpaque ||
            !request.LimpiezaVehiculo;

        return hayFallaCritica
            ? ResultadoInspeccion.Rechazado
            : ResultadoInspeccion.Aprobado;
    }
}