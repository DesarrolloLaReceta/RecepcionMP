using SistemaRecepcionMP.Domain.Exceptions.Proveedores;
using SistemaRecepcionMP.Domain.Interfaces;
using SistemaRecepcionMP.Domain.Enums;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Proveedores.Commands.ActualizarProveedor;

public sealed class ActualizarProveedorCommandHandler : IRequestHandler<ActualizarProveedorCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public ActualizarProveedorCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(
        ActualizarProveedorCommand request,
        CancellationToken cancellationToken)
    {
        var proveedor = await _unitOfWork.Proveedores.GetByIdAsync(request.Id)
            ?? throw new ProveedorNotFoundException(request.Id);

        proveedor.RazonSocial = request.RazonSocial.Trim();
        proveedor.Telefono = request.Telefono?.Trim();
        proveedor.EmailContacto = request.EmailContacto?.Trim().ToLowerInvariant();
        proveedor.Direccion = request.Direccion?.Trim();
        if (request.Estado.HasValue)
            proveedor.Estado = request.Estado.Value;
        proveedor.ActualizadoEn = DateTime.UtcNow;

        _unitOfWork.Proveedores.Update(proveedor);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}