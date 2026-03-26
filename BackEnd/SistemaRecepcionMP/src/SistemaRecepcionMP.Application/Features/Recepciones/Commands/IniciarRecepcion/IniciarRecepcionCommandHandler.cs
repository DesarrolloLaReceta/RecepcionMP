using SistemaRecepcionMP.Domain.Entities;
using MediatR;
using SistemaRecepcionMP.Domain.Exceptions;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.IniciarRecepcion;

public class IniciarRecepcionHandler : IRequestHandler<IniciarRecepcionCommand, Guid>
{
    private readonly IRecepcionRepository _recepcionRepository;
    private readonly IOrdenCompraRepository _ordenCompraRepository;

    public IniciarRecepcionHandler(
        IRecepcionRepository recepcionRepository,
        IOrdenCompraRepository ordenCompraRepository)
    {
        _recepcionRepository = recepcionRepository;
        _ordenCompraRepository = ordenCompraRepository;
    }

    public async Task<Guid> Handle(IniciarRecepcionCommand request, CancellationToken cancellationToken)
    {
        var ordenCompra = await _ordenCompraRepository.GetByIdAsync(request.OrdenCompraId);

        if (ordenCompra is null)
            throw new BusinessRuleException("La orden de compra no existe.");

        var existe = await _recepcionRepository
            .ExisteRecepcionActivaPorOrdenCompra(request.OrdenCompraId);

        if (existe)
            throw new BusinessRuleException("Ya existe una recepción activa para esta orden de compra.");

        var recepcion = new Recepcion(
            request.OrdenCompraId,
            request.ProveedorId,
            request.UsuarioId
        );

        if (!string.IsNullOrWhiteSpace(request.ObservacionesGenerales))
            recepcion.AgregarObservaciones(request.ObservacionesGenerales);

        await _recepcionRepository.AddAsync(recepcion);

        return recepcion.Id;
    }
}