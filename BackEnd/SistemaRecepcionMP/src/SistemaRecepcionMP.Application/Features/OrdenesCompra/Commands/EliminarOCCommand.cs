using MediatR;
using SistemaRecepcionMP.Application.Common.Behaviours;
using SistemaRecepcionMP.Domain.Interfaces;

namespace SistemaRecepcionMP.Application.Features.OrdenesCompra.Commands;

public sealed class EliminarOCCommand : IRequest, IAuditableCommand
{
    public Guid Id { get; set; }

    public string EntidadAfectada => "OrdenCompra";
    public string RegistroId => Id.ToString();
}

public sealed class EliminarOCCommandHandler : IRequestHandler<EliminarOCCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public EliminarOCCommandHandler(IUnitOfWork unitOfWork)
        => _unitOfWork = unitOfWork;

    public async Task Handle(EliminarOCCommand request, CancellationToken cancellationToken)
    {
        var oc = await _unitOfWork.OrdenesCompra.GetByIdAsync(request.Id)
            ?? throw new KeyNotFoundException($"OC {request.Id} no encontrada.");

        if (oc.Recepciones.Any())
            throw new InvalidOperationException(
                "No se puede eliminar una OC que ya tiene recepciones registradas.");

        _unitOfWork.OrdenesCompra.Delete(oc);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}