using SistemaRecepcionMP.Application.Common.Exceptions;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Exceptions.Proveedores;
using SistemaRecepcionMP.Domain.Interfaces;
using SistemaRecepcionMP.Domain.Enums;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.OrdenesCompra.Commands.CrearOrdenCompra;

public sealed class CrearOrdenCompraCommandHandler : IRequestHandler<CrearOrdenCompraCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly Application.Common.Interfaces.ICurrentUserService _currentUser;

    public CrearOrdenCompraCommandHandler(
        IUnitOfWork unitOfWork,
        Application.Common.Interfaces.ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(
        CrearOrdenCompraCommand request,
        CancellationToken cancellationToken)
    {
        // Verificar número de OC único
        var ocExistente = await _unitOfWork.OrdenesCompra.GetByNumeroOCAsync(request.NumeroOC);
        if (ocExistente is not null)
            throw new ValidationException("NumeroOC",
                $"Ya existe una orden de compra con el número '{request.NumeroOC}'.");

        // Verificar que el proveedor existe y está activo
        var proveedor = await _unitOfWork.Proveedores.GetByIdAsync(request.ProveedorId)
            ?? throw new ProveedorNotFoundException(request.ProveedorId);

        if (proveedor.Estado != EstadoProveedor.Activo)
            throw new ProveedorNoHabilitadoException(proveedor.RazonSocial,
                $"El proveedor está inactivo y no puede ser asociado a una OC.");

        // Verificar que todos los ítems existen y están activos
        foreach (var detalle in request.Detalles)
        {
            var item = await _unitOfWork.Items.GetByIdAsync(detalle.ItemId)
                ?? throw new ValidationException("ItemId",
                    $"No se encontró el ítem con ID '{detalle.ItemId}'.");

            if (!item.Estado)
                throw new ValidationException("ItemId",
                    $"El ítem '{item.Nombre}' está inactivo y no puede incluirse en una OC.");
        }

        var ordenCompra = new OrdenCompra
        {
            NumeroOC = request.NumeroOC.Trim().ToUpperInvariant(),
            ProveedorId = request.ProveedorId,
            FechaEmision = request.FechaEmision,
            FechaEntregaEsperada = request.FechaEntregaEsperada,
            Estado = Domain.Enums.EstadoOrdenCompra.Abierta,
            Observaciones = request.Observaciones?.Trim(),
            CreadoPor = _currentUser.UserId,
            CreadoEn = DateTime.UtcNow
        };

        // Agregar detalles a la colección — EF los inserta automáticamente
        foreach (var detalle in request.Detalles)
        {
            ordenCompra.Detalles.Add(new DetalleOrdenCompra
            {
                ItemId = detalle.ItemId,
                CantidadSolicitada = detalle.CantidadSolicitada,
                UnidadMedida = detalle.UnidadMedida.Trim(),
                PrecioUnitario = detalle.PrecioUnitario,
                CantidadRecibida = 0,
                CantidadRechazada = 0
            });
        }

        await _unitOfWork.OrdenesCompra.AddAsync(ordenCompra);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ordenCompra.Id;
    }
}