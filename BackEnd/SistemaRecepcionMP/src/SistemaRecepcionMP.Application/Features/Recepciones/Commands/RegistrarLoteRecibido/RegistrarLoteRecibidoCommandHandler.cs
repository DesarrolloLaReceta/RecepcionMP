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

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.RegistrarLoteRecibido;

public sealed class RegistrarLoteRecibidoCommandHandler
    : IRequestHandler<RegistrarLoteRecibidoCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;
    private readonly IQrCodeService _qrCodeService;
    private readonly IFileStorageService _fileStorage;

    public RegistrarLoteRecibidoCommandHandler(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUser,
        IQrCodeService qrCodeService,
        IFileStorageService fileStorage)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
        _qrCodeService = qrCodeService;
        _fileStorage = fileStorage;
    }

    public async Task<Guid> Handle(
        RegistrarLoteRecibidoCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Verificar recepción en estado válido
        var recepcion = await _unitOfWork.Recepciones.GetWithLotesAsync(request.RecepcionId)
            ?? throw new RecepcionNotFoundException(request.RecepcionId);

        if (recepcion.Estado != EstadoRecepcion.EnInspeccion)
            throw new RecepcionEstadoInvalidoException(
                recepcion.NumeroRecepcion,
                recepcion.Estado,
                "registrar lote");

        // 2. Verificar ítem existe
        // FIX E2: ValidationException vive en Application.Common.Exceptions, no en Domain
        var item = await _unitOfWork.Items.GetByIdAsync(request.ItemId)
            ?? throw new ValidationException("ItemId",
                $"No se encontró el ítem con ID '{request.ItemId}'.");

        // 3. Construir VidaUtil y validar vida útil mínima
        var vidaUtil = new VidaUtil(request.FechaVencimiento);

        if (vidaUtil.EstaVencido)
            throw new LoteVencidoException(
                request.NumeroLoteProveedor ?? "Sin lote",
                request.FechaVencimiento);

        if (!vidaUtil.CumpleVidaUtilMinima(item.VidaUtilDias))
            throw new VidaUtilInsuficienteException(
                request.NumeroLoteProveedor ?? "Sin lote",
                vidaUtil.DiasRestantes,
                item.VidaUtilDias);

        // 4. Validar rotulado
        if (request.EstadoRotulado == EstadoRotulado.SinRotulo)
            throw new BusinessRuleException(
                $"El ítem '{item.Nombre}' llegó sin rótulo y debe ser rechazado según las reglas BPM.");

        // 5. Generar código de lote interno
        var codigoLoteInterno = GenerarCodigoLote(item.CategoriaId, request.FechaVencimiento);

        // 6. Crear el lote usando el método de fábrica del Domain
        // FIX E3: las propiedades con private set se asignan dentro del propio Domain
        var lote = LoteRecibido.Crear(
            recepcionId: recepcion.Id,
            detalleOcId: request.DetalleOcId,
            itemId: request.ItemId,
            numeroLoteProveedor: request.NumeroLoteProveedor?.Trim(),
            codigoLoteInterno: codigoLoteInterno,
            fechaFabricacion: request.FechaFabricacion,
            vidaUtil: vidaUtil,
            cantidadRecibida: request.CantidadRecibida,
            unidadMedida: request.UnidadMedida.Trim(),
            temperaturaMedida: request.TemperaturaMedida,
            estadoSensorial: request.EstadoSensorial,
            estadoRotulado: request.EstadoRotulado,
            ubicacionDestino: request.UbicacionDestino,
            registradoPor: _currentUser.UserId);

        // 7. Generar QR y asignarlo con el método de dominio
        // FIX E1: CodigoQr tiene private set — se asigna con AsignarCodigoQr()
        var urlQr = await _qrCodeService.GenerarParaLoteAsync(
            codigoLoteInterno,
            item.Nombre,
            recepcion.Proveedor?.RazonSocial ?? string.Empty,
            request.FechaVencimiento,
            request.UbicacionDestino?.ToString() ?? "Sin asignar",
            cancellationToken);

        lote.AsignarCodigoQr(urlQr);

        recepcion.Lotes.Add(lote);
        _unitOfWork.Recepciones.Update(recepcion);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return lote.Id;
    }

    private static string GenerarCodigoLote(Guid categoriaId, DateOnly fechaVencimiento)
    {
        var fecha = fechaVencimiento.ToString("yyyyMMdd");
        var sufijo = Guid.NewGuid().ToString("N")[..6].ToUpperInvariant();
        return $"LOT-{fecha}-{sufijo}";
    }
}