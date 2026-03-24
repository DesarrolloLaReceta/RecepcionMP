using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Application.Common.Exceptions;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Exceptions.Lotes;
using SistemaRecepcionMP.Domain.Exceptions.Recepciones;
using SistemaRecepcionMP.Domain.Interfaces;
using SistemaRecepcionMP.Domain.ValueObjects;
using MediatR;
using SistemaRecepcionMP.Domain.Exceptions;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.AgregarLoteAItem;

public sealed class AgregarLoteAItemCommandHandler
    : IRequestHandler<AgregarLoteAItemCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;
    private readonly IQrCodeService _qrCodeService;

    public AgregarLoteAItemCommandHandler(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUser,
        IQrCodeService qrCodeService)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
        _qrCodeService = qrCodeService;
    }

    public async Task<Guid> Handle(
        AgregarLoteAItemCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Obtener recepción con Items + Lotes
        var recepcion = await _unitOfWork.Recepciones
            .GetWithItemsAndLotesAsync(request.RecepcionId)
            ?? throw new RecepcionNotFoundException(request.RecepcionId);

        // 2. Validar estado
        recepcion.ValidarPuedeRegistrarLotes();

        // 3. Obtener RecepcionItem (PUNTO CLAVE)
        var itemRecepcion = recepcion.Items
            .FirstOrDefault(x => x.DetalleOrdenCompraId == request.DetalleOcId)
            ?? throw new BusinessRuleException(
                "El ítem no pertenece a la recepción.");

        // 4. Obtener datos del item (catálogo)
        var item = await _unitOfWork.Items.GetByIdAsync(request.ItemId)
            ?? throw new ValidationException("ItemId",
                $"No se encontró el ítem con ID '{request.ItemId}'.");

        // 5. Crear VO VidaUtil
        var vidaUtil = new VidaUtil(request.FechaVencimiento);

        // 6. Crear lote (DOMINIO)
        var lote = LoteRecibido.Crear(
            recepcionItemId: itemRecepcion.Id,
            detalleOcId: request.DetalleOcId,
            itemId: request.ItemId,
            numeroLoteProveedor: request.NumeroLoteProveedor?.Trim(),
            fechaFabricacion: request.FechaFabricacion,
            vidaUtil: vidaUtil,
            cantidadRecibida: request.CantidadRecibida,
            unidadMedida: request.UnidadMedida.Trim(),
            temperaturaMedida: request.TemperaturaMedida,
            estadoSensorial: request.EstadoSensorial,
            estadoRotulado: request.EstadoRotulado,
            ubicacionDestino: request.UbicacionDestino,
            registradoPor: _currentUser.UserId
        );

        // 7. Generar QR (infraestructura)
        var urlQr = await _qrCodeService.GenerarParaLoteAsync(
            lote.CodigoLoteInterno,
            item.Nombre,
            recepcion.Proveedor?.RazonSocial ?? string.Empty,
            request.FechaVencimiento,
            request.UbicacionDestino?.ToString() ?? "Sin asignar",
            cancellationToken);

        lote.AsignarCodigoQr(urlQr);

        // 8. Agregar lote al item (DOMINIO)
        itemRecepcion.AgregarLote(lote);

        // 9. Actualizar estado de recepción (DOMINIO)
        recepcion.MarcarRegistroLotesEnProceso();

        // 10. Guardar
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return lote.Id;
    }
}