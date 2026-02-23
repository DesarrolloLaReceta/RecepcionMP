using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Exceptions.Proveedores;
using SistemaRecepcionMP.Domain.Interfaces;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Proveedores.Commands.CrearProveedor;

public sealed class CrearProveedorCommandHandler : IRequestHandler<CrearProveedorCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;

    public CrearProveedorCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(
        CrearProveedorCommand request,
        CancellationToken cancellationToken)
    {
        // Verificar que no exista otro proveedor con el mismo NIT
        var existe = await _unitOfWork.Proveedores.GetByNitAsync(request.Nit);
        if (existe is not null)
            throw new NitDuplicadoException(request.Nit);

        var proveedor = new Proveedor
        {
            RazonSocial = request.RazonSocial.Trim(),
            Nit = request.Nit.Trim(),
            Telefono = request.Telefono?.Trim(),
            EmailContacto = request.EmailContacto?.Trim().ToLowerInvariant(),
            Direccion = request.Direccion?.Trim(),
            Estado = true,
            CreadoEn = DateTime.UtcNow
        };

        await _unitOfWork.Proveedores.AddAsync(proveedor);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return proveedor.Id;
    }
}