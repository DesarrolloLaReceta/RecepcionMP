using SistemaRecepcionMP.Application.Common.Exceptions;
using SistemaRecepcionMP.Domain.Interfaces;
using SistemaRecepcionMP.Domain.ValueObjects;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Items.Commands.ActualizarItem;

public sealed class ActualizarItemCommandHandler : IRequestHandler<ActualizarItemCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public ActualizarItemCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(
        ActualizarItemCommand request,
        CancellationToken cancellationToken)
    {
        var item = await _unitOfWork.Items.GetByIdAsync(request.Id)
            ?? throw new ValidationException("Id", $"No se encontró el ítem con ID '{request.Id}'.");

        // Construir el Value Object RangoTemperatura si se proporcionaron los valores
        RangoTemperatura? rangoTemperatura = null;
        if (request.TemperaturaMinima.HasValue && request.TemperaturaMaxima.HasValue)
            rangoTemperatura = new RangoTemperatura(request.TemperaturaMinima.Value, request.TemperaturaMaxima.Value);

        item.Nombre = request.Nombre.Trim();
        item.Descripcion = request.Descripcion?.Trim();
        item.UnidadMedida = request.UnidadMedida.Trim();
        item.VidaUtilDias = request.VidaUtilDias;
        item.RangoTemperatura = rangoTemperatura;
        item.RequiereLoteProveedor = request.RequiereLoteProveedor;
        item.Estado = request.Estado;

        _unitOfWork.Items.Update(item);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}