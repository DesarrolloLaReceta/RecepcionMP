
using MediatR;
using SistemaRecepcionMP.Domain.Exceptions;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.EvaluarCalidad;

public class EvaluarCalidadHandler 
    : IRequestHandler<EvaluarCalidadCommand, Unit>
{
    private readonly IRecepcionRepository _repo;

    public EvaluarCalidadHandler(IRecepcionRepository repo)
    {
        _repo = repo;
    }

    public async Task<Unit> Handle(
        EvaluarCalidadCommand request,
        CancellationToken cancellationToken)
    {
        var recepcion = await _repo
            .GetWithItemsAndLotesAsync(request.RecepcionId);

        if (recepcion is null)
            throw new NotFoundException("Recepcion", request.RecepcionId);

        var lote = recepcion.Items
            .SelectMany(x => x.Lotes)
            .FirstOrDefault(x => x.Id == request.LoteId);

        if (lote is null)
            throw new NotFoundException("Lote", request.LoteId);

        lote.EvaluarCalidad(
            request.EstadoCalidad,
            request.CantidadAprobada,
            request.CantidadRechazada,
            request.Observaciones
        );

        await _repo.UpdateAsync(recepcion);

        return Unit.Value;
    }
}