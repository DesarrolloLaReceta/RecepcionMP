using MediatR;
using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Application.Features.Recepciones.Commands.FinalizarRecepcion;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Exceptions;
using SistemaRecepcionMP.Domain.Interfaces;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.SincronizarRecepcionConSiesa;

public sealed class SincronizarRecepcionConSiesaCommand : IRequest<SincronizarRecepcionConSiesaResult>
{
    public Guid RecepcionId { get; set; }
}

public enum SincronizacionSiesaEstado
{
    SinExcedentes = 0,
    ExcedentesPersisten = 1
}

public sealed record SincronizarRecepcionConSiesaResult(
    SincronizacionSiesaEstado Resultado,
    Guid RecepcionId,
    IReadOnlyCollection<ExcedenteDetectadoDetalle>? Excedentes = null,
    string? Mensaje = null
);

public sealed class SincronizarRecepcionConSiesaCommandHandler
    : IRequestHandler<SincronizarRecepcionConSiesaCommand, SincronizarRecepcionConSiesaResult>
{
    private readonly IRecepcionRepository _recepcionRepository;
    private readonly IRecepcionNovedadRepository _novedadesRepository;
    private readonly ISiesaService _siesaService;
    private readonly IUnitOfWork _unitOfWork;

    public SincronizarRecepcionConSiesaCommandHandler(
        IRecepcionRepository recepcionRepository,
        IRecepcionNovedadRepository novedadesRepository,
        ISiesaService siesaService,
        IUnitOfWork unitOfWork)
    {
        _recepcionRepository = recepcionRepository;
        _novedadesRepository = novedadesRepository;
        _siesaService = siesaService;
        _unitOfWork = unitOfWork;
    }

    public async Task<SincronizarRecepcionConSiesaResult> Handle(
        SincronizarRecepcionConSiesaCommand request,
        CancellationToken cancellationToken)
    {
        var recepcion = await _recepcionRepository.GetWithItemsAndLotesAsync(request.RecepcionId);
        if (recepcion is null)
            throw new NotFoundException("Recepcion", request.RecepcionId);

        var novedadActiva = await _novedadesRepository.ObtenerActivaExcedenteAsync(request.RecepcionId, cancellationToken);
        if (novedadActiva is null)
            throw new NotFoundException("RecepcionNovedadActiva", request.RecepcionId);

        var cantidadesSiesa = await _siesaService.ObtenerCantidadesEsperadasAsync(
            recepcion.OrdenCompraId,
            cancellationToken);

        var cantidadesPorItem = cantidadesSiesa
            .GroupBy(x => x.ItemId)
            .ToDictionary(g => g.Key, g => g.First());

        var excedentesActuales = recepcion.Items
            .Where(i =>
            {
                if (!cantidadesPorItem.TryGetValue(i.ItemId, out var siesaItem))
                    return false;
                return i.CantidadRecibida > siesaItem.CantidadSiesa;
            })
            .Select(i =>
            {
                var siesaItem = cantidadesPorItem[i.ItemId];
                return new ExcedenteDetectadoDetalle(
                    i.Id,
                    i.ItemId,
                    i.CantidadRecibida,
                    siesaItem.CantidadSiesa,
                    i.CantidadRecibida - siesaItem.CantidadSiesa,
                    i.UnidadMedida);
            })
            .ToList();

        if (excedentesActuales.Count == 0)
        {
            novedadActiva.MarcarResuelta();
            recepcion.RestaurarEstadoPrevioFinalizacion();

            _novedadesRepository.Update(novedadActiva);
            _recepcionRepository.Update(recepcion);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new SincronizarRecepcionConSiesaResult(
                SincronizacionSiesaEstado.SinExcedentes,
                recepcion.Id,
                Mensaje: "La recepción fue sincronizada y la novedad quedó resuelta.");
        }

        return new SincronizarRecepcionConSiesaResult(
            SincronizacionSiesaEstado.ExcedentesPersisten,
            recepcion.Id,
            excedentesActuales,
            "Persisten diferencias frente a SIESA. La recepción continúa en PendienteAjuste.");
    }
}
