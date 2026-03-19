using MediatR;
using SistemaRecepcionMP.Application.Common.Behaviours;
using SistemaRecepcionMP.Domain.Interfaces;
using FluentValidation;

namespace SistemaRecepcionMP.Application.Features.Checklists.Commands;

public sealed class ActualizarCheckListCommand : IRequest, IAuditableCommand
{
    public Guid ChecklistId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public Guid CategoriaId { get; set; }

    public string EntidadAfectada => "ChecklistBPM";
    public string RegistroId => ChecklistId.ToString();
}

public sealed class ActualizarChecklistCommandValidator : AbstractValidator<ActualizarCheckListCommand>
{
    public ActualizarChecklistCommandValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre es obligatorio.")
            .MaximumLength(200);
        RuleFor(x => x.CategoriaId)
            .NotEmpty().WithMessage("La categoría es obligatoria.");
    }
}

public sealed class ActualizarChecklistCommandHandler : IRequestHandler<ActualizarCheckListCommand>
{
    private readonly IUnitOfWork _unitOfWork;
    public ActualizarChecklistCommandHandler(IUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task Handle(ActualizarCheckListCommand request, CancellationToken cancellationToken)
    {
        var checklist = await _unitOfWork.Checklists.GetByIdAsync(request.ChecklistId)
            ?? throw new KeyNotFoundException($"Checklist {request.ChecklistId} no encontrado.");

        checklist.Nombre     = request.Nombre.Trim();
        checklist.CategoriaId = request.CategoriaId;

        _unitOfWork.Checklists.Update(checklist);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}