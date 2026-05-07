using MediatR;
using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Exceptions;
using SistemaRecepcionMP.Domain.Interfaces;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.FinalizarRecepcion;

public class FinalizarRecepcionHandler 
    : IRequestHandler<FinalizarRecepcionCommand, FinalizarRecepcionResult>
{
    private readonly IRecepcionRepository _repo;
    private readonly IRecepcionNovedadRepository _novedadesRepo;
    private readonly ISiesaService _siesaService;
    private readonly ICurrentUserService _currentUser;
    private readonly IUnitOfWork _unitOfWork;

    public FinalizarRecepcionHandler(
        IRecepcionRepository repo,
        IRecepcionNovedadRepository novedadesRepo,
        ISiesaService siesaService,
        ICurrentUserService currentUser,
        IUnitOfWork unitOfWork)
    {
        _repo = repo;
        _novedadesRepo = novedadesRepo;
        _siesaService = siesaService;
        _currentUser = currentUser;
        _unitOfWork = unitOfWork;
    }

    public async Task<FinalizarRecepcionResult> Handle(
        FinalizarRecepcionCommand request,
        CancellationToken cancellationToken)
    {
        var recepcion = await _repo
            .GetWithItemsAndLotesAsync(request.RecepcionId);

        if (recepcion is null)
            throw new NotFoundException("Recepcion", request.RecepcionId);

        var existePendiente = await _novedadesRepo.ExistePendientePorTipoAsync(
            recepcion.Id,
            TipoNovedadRecepcion.ExcedenteSiesa,
            cancellationToken);

        if (existePendiente)
        {
            recepcion.MarcarPendienteAjuste("Existe novedad de excedente pendiente por gestionar.");
            _repo.Update(recepcion);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new FinalizarRecepcionResult(
                FinalizarRecepcionEstado.ExcedenteDetectado,
                recepcion.Id);
        }

        var cantidadesSiesa = await _siesaService.ObtenerCantidadesEsperadasAsync(
            recepcion.OrdenCompraId,
            cancellationToken);

        var cantidadesPorItem = cantidadesSiesa
            .GroupBy(x => x.ItemId)
            .ToDictionary(g => g.Key, g => g.First());

        var excedentes = recepcion.Items
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

        if (excedentes.Count > 0)
        {
            var novedad = new RecepcionNovedad(
                recepcion.Id,
                TipoNovedadRecepcion.ExcedenteSiesa,
                _currentUser.UserId,
                "FinalizarRecepcion",
                "Se detectó excedente entre cantidad física y cantidad SIESA.");

            foreach (var ex in excedentes)
            {
                novedad.AgregarDetalle(
                    new RecepcionNovedadDetalle(
                        novedad.Id,
                        ex.RecepcionItemId,
                        ex.ItemId,
                        ex.CantidadFisica,
                        ex.CantidadSiesa,
                        ex.UnidadMedida));
            }

            recepcion.MarcarPendienteAjuste("Excedente detectado frente a SIESA.");

            await _novedadesRepo.AddAsync(novedad);
            _repo.Update(recepcion);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new FinalizarRecepcionResult(
                FinalizarRecepcionEstado.ExcedenteDetectado,
                recepcion.Id,
                excedentes);
        }

        recepcion.Finalizar();

        _repo.Update(recepcion);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new FinalizarRecepcionResult(
            FinalizarRecepcionEstado.Finalizada,
            recepcion.Id);
    }
}