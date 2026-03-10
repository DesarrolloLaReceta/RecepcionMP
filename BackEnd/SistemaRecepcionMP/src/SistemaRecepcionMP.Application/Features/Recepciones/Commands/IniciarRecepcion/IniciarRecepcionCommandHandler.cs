using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Exceptions.OrdenesCompra;
using SistemaRecepcionMP.Domain.Exceptions.Proveedores;
using SistemaRecepcionMP.Domain.Interfaces;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.IniciarRecepcion;

public sealed class IniciarRecepcionCommandHandler : IRequestHandler<IniciarRecepcionCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public IniciarRecepcionCommandHandler(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(
        IniciarRecepcionCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Verificar que la OC existe y está en estado que permite recepción
        var oc = await _unitOfWork.OrdenesCompra.GetByIdAsync(request.OrdenCompraId)
            ?? throw new OrdenCompraNotFoundException(request.OrdenCompraId);

        if (oc.Estado != EstadoOrdenCompra.Abierta &&
            oc.Estado != EstadoOrdenCompra.ParcialmenteRecibida)
            throw new OrdenCompraNoAbiertaException(oc.NumeroOC, oc.Estado);

        // 2. Verificar que el proveedor está habilitado
        var proveedor = await _unitOfWork.Proveedores
            .GetWithDocumentosSanitariosAsync(oc.ProveedorId)
            ?? throw new ProveedorNotFoundException(oc.ProveedorId);

        if (proveedor.Estado != EstadoProveedor.Activo)
            throw new ProveedorNoHabilitadoException(proveedor.RazonSocial,
                $"El proveedor está inactivo y no puede recibir mercancía.");

        // 3. Verificar documentos sanitarios del proveedor vigentes
        var documentosVencidos = proveedor.DocumentosSanitarios
            .Where(d => d.EstaVencido)
            .Select(d => d.TipoDocumento)
            .ToList();

        if (documentosVencidos.Any())
            throw new ProveedorNoHabilitadoException(proveedor.RazonSocial, documentosVencidos);

        // 4. Generar número consecutivo de recepción
        var numeroRecepcion = await GenerarNumeroRecepcionAsync();

        // 5. Crear la recepción
        var recepcion = new Recepcion
        {
            NumeroRecepcion = numeroRecepcion,
            OrdenCompraId = oc.Id,
            ProveedorId = oc.ProveedorId,
            FechaRecepcion = request.FechaRecepcion,
            HoraLlegadaVehiculo = request.HoraLlegadaVehiculo,
            PlacaVehiculo = request.PlacaVehiculo?.Trim().ToUpperInvariant(),
            NombreTransportista = request.NombreTransportista?.Trim(),
            ObservacionesGenerales = request.ObservacionesGenerales?.Trim(),
            Estado = EstadoRecepcion.Borrador,
            CreadoPor = _currentUser.UserId,
            CreadoEn = DateTime.UtcNow
        };

        await _unitOfWork.Recepciones.AddAsync(recepcion);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return recepcion.Id;
    }

    private async Task<string> GenerarNumeroRecepcionAsync()
    {
        var año = DateTime.UtcNow.Year;
        var todas = await _unitOfWork.Recepciones.GetAllAsync();
        var totalAño = todas.Count(r => r.CreadoEn.Year == año);
        return $"REC-{año}-{(totalAño + 1):D5}";
    }
}