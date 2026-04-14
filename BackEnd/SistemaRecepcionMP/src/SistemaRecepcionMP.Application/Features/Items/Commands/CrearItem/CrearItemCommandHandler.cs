using SistemaRecepcionMP.Application.Common.Exceptions;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Interfaces;
using SistemaRecepcionMP.Domain.ValueObjects;
using SistemaRecepcionMP.Application.Common.Interfaces;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Items.Commands.CrearItem;

public sealed class CrearItemCommandHandler : IRequestHandler<CrearItemCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDateTime _dateTime;

    public CrearItemCommandHandler(IUnitOfWork unitOfWork, IDateTime dateTime)
    {
        _unitOfWork = unitOfWork;
        _dateTime = dateTime;
    }

    public async Task<Guid> Handle(
        CrearItemCommand request,
        CancellationToken cancellationToken)
    {
        // Verificar código interno único
        var itemExistente = await _unitOfWork.Items.GetByCodigoInternoAsync(request.CodigoInterno);
        if (itemExistente is not null)
            throw new ValidationException("CodigoInterno",
                $"Ya existe un ítem con el código interno '{request.CodigoInterno}'.");

        // Construir el Value Object RangoTemperatura si se proporcionaron los valores
        RangoTemperatura? rangoTemperatura = null;
        if (request.TemperaturaMinima.HasValue && request.TemperaturaMaxima.HasValue)
            rangoTemperatura = new RangoTemperatura(request.TemperaturaMinima.Value, request.TemperaturaMaxima.Value);

        var item = new Item
        {
            CodigoInterno = request.CodigoInterno.Trim().ToUpperInvariant(),
            Nombre = request.Nombre.Trim(),
            Descripcion = request.Descripcion?.Trim(),
            CategoriaId = request.CategoriaId,
            UnidadMedida = request.UnidadMedida.Trim(),
            VidaUtilDias = request.VidaUtilDias,
            RangoTemperatura = rangoTemperatura,
            RequiereLoteProveedor = request.RequiereLoteProveedor,
            Estado = true,
            CreadoEn = _dateTime.Now
        };

        await _unitOfWork.Items.AddAsync(item);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return item.Id;
    }
}