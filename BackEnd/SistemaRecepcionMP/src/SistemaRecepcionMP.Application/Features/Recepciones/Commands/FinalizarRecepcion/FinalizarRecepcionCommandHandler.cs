

using MediatR;
using SistemaRecepcionMP.Domain.Exceptions.Recepciones;
using SistemaRecepcionMP.Domain.Interfaces;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.FinalizarRecepcion;

public sealed class FinalizarRecepcionCommandHandler
    : IRequestHandler<FinalizarRecepcionCommand, Unit>
{
    private readonly IUnitOfWork _unitOfWork;

    public FinalizarRecepcionCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(
        FinalizarRecepcionCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Cargar agregado completo
        var recepcion = await _unitOfWork.Recepciones
            .GetWithItemsAndLotesAsync(request.RecepcionId)
            ?? throw new RecepcionNotFoundException(request.RecepcionId);

        // 2. Delegar al dominio (CLAVE)
        recepcion.Finalizar();

        // 3. Guardar
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}