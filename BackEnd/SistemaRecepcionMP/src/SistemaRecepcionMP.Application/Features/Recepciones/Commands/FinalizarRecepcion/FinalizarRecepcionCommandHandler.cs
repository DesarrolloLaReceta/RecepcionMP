using MediatR;
using SistemaRecepcionMP.Domain.Exceptions;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.FinalizarRecepcion;

public class FinalizarRecepcionHandler 
    : IRequestHandler<FinalizarRecepcionCommand, Unit>
{
    private readonly IRecepcionRepository _repo;

    public FinalizarRecepcionHandler(IRecepcionRepository repo)
    {
        _repo = repo;
    }

    public async Task<Unit> Handle(
        FinalizarRecepcionCommand request,
        CancellationToken cancellationToken)
    {
        var recepcion = await _repo
            .GetWithItemsAndLotesAsync(request.RecepcionId);

        if (recepcion is null)
            throw new NotFoundException("Recepcion", request.RecepcionId);

        recepcion.Finalizar();

        await _repo.UpdateAsync(recepcion);

        return Unit.Value;
    }
}