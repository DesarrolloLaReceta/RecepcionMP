
using MediatR;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Exceptions;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.AgregarFactura;

public class AgregarFacturaHandler 
    : IRequestHandler<AgregarFacturaCommand, Unit>
{
    private readonly IRecepcionRepository _recepcionRepository;

    public AgregarFacturaHandler(IRecepcionRepository recepcionRepository)
    {
        _recepcionRepository = recepcionRepository;
    }

    public async Task<Unit> Handle(
        AgregarFacturaCommand request,
        CancellationToken cancellationToken)
    {
        var recepcion = await _recepcionRepository
            .GetByIdAsync(request.RecepcionId);

        if (recepcion is null)
            throw new NotFoundException("Recepcion", request.RecepcionId);

        var factura = new Factura(
            request.NumeroFactura,
            request.FechaFactura,
            request.TotalFactura
        );

        recepcion.AgregarFactura(factura);

        await _recepcionRepository.UpdateAsync(recepcion);

        return Unit.Value;
    }
}