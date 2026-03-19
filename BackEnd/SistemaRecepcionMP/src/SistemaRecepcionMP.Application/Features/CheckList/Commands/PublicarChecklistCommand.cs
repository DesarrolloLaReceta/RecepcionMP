using MediatR;
using SistemaRecepcionMP.Application.Common.Behaviours;
using SistemaRecepcionMP.Domain.Interfaces;

namespace SistemaRecepcionMP.Application.Features.Checklists.Commands;

public sealed class PublicarChecklistCommand : IRequest, IAuditableCommand
{
    public Guid ChecklistId { get; set; }
    public bool Activar { get; set; } = true;
    public string EntidadAfectada => "ChecklistBPM";
    public string RegistroId => ChecklistId.ToString();
}

public sealed class PublicarChecklistCommandHandler : IRequestHandler<PublicarChecklistCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public PublicarChecklistCommandHandler(IUnitOfWork unitOfWork)
        => _unitOfWork = unitOfWork;

    public async Task Handle(PublicarChecklistCommand request, CancellationToken cancellationToken)
    {
        var checklist = await _unitOfWork.Checklists.GetByIdAsync(request.ChecklistId)
            ?? throw new KeyNotFoundException($"Checklist {request.ChecklistId} no encontrado.");

        if (request.Activar)
        {
            var tieneItems = await _unitOfWork.Checklists.ExisteItemsAsync(request.ChecklistId);
            if (!tieneItems)
                throw new InvalidOperationException(
                    "No se puede publicar un checklist sin criterios.");
        }

        checklist.Estado = request.Activar;
        _unitOfWork.Checklists.Update(checklist);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}