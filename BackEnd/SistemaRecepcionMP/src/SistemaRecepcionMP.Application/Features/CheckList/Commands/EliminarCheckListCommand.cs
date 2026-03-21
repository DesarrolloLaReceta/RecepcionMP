using MediatR;
using SistemaRecepcionMP.Application.Common.Behaviours;
using SistemaRecepcionMP.Domain.Interfaces;

namespace SistemaRecepcionMP.Application.Features.Checklists.Commands;

public sealed class EliminarCheckListCommand : IRequest, IAuditableCommand
{
    public Guid ChecklistId { get; set; }
    public string EntidadAfectada => "ChecklistBPM";
    public string RegistroId => ChecklistId.ToString();
}

public sealed class EliminarChecklistCommandHandler : IRequestHandler<EliminarCheckListCommand>
{
    private readonly IUnitOfWork _unitOfWork;
    public EliminarChecklistCommandHandler(IUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task Handle(EliminarCheckListCommand request, CancellationToken cancellationToken)
    {
        // Verificar existencia sin trackear
        if (!await _unitOfWork.Checklists.ExisteAsync(request.ChecklistId))
            throw new KeyNotFoundException($"Checklist {request.ChecklistId} no encontrado.");

        // Verificar que no tiene resultados
        var tieneResultados = await _unitOfWork.Checklists.TieneResultadosAsync(request.ChecklistId);
        if (tieneResultados)
            throw new InvalidOperationException(
                "No se puede eliminar un checklist que ya tiene resultados de inspección registrados.");

        // Eliminar ítems con SQL directo
        await _unitOfWork.Checklists.RemoverItemsAsync(request.ChecklistId);

        // Eliminar el checklist con SQL directo
        await _unitOfWork.Checklists.EliminarAsync(request.ChecklistId);
    }
}