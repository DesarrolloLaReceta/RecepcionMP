using SistemaRecepcionMP.Application.Common.Behaviours;
using SistemaRecepcionMP.Application.Common.Exceptions;
using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Checklists.Commands;

// ─── Command ────────────────────────────────────────────────────────────────

public sealed class CrearChecklistCommand : IRequest<Guid>, IAuditableCommand
{
    public string Nombre { get; set; } = string.Empty;
    public Guid CategoriaId { get; set; }
    public List<ItemChecklistRequest> Items { get; set; } = new();

    // IAuditableCommand
    public string EntidadAfectada => "ChecklistBPM";
    public string RegistroId => CategoriaId.ToString();
}

public sealed class ItemChecklistRequest
{
    public string Criterio { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public bool EsCritico { get; set; }
    public int Orden { get; set; }
}

// ─── Validator ───────────────────────────────────────────────────────────────

public sealed class CrearChecklistCommandValidator : AbstractValidator<CrearChecklistCommand>
{
    public CrearChecklistCommandValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre del checklist es obligatorio.")
            .MaximumLength(200).WithMessage("El nombre no puede superar 200 caracteres.");

        RuleFor(x => x.CategoriaId)
            .NotEmpty().WithMessage("La categoría es obligatoria.");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("El checklist debe tener al menos un ítem.")
            .Must(items => items.Select(i => i.Orden).Distinct().Count() == items.Count)
            .WithMessage("Los ítems no pueden tener el mismo número de orden.");

        RuleForEach(x => x.Items).SetValidator(new ItemChecklistRequestValidator());
    }
}

public sealed class ItemChecklistRequestValidator : AbstractValidator<ItemChecklistRequest>
{
    public ItemChecklistRequestValidator()
    {
        RuleFor(x => x.Criterio)
            .NotEmpty().WithMessage("El criterio del ítem es obligatorio.")
            .MaximumLength(300).WithMessage("El criterio no puede superar 300 caracteres.");

        RuleFor(x => x.Descripcion)
            .MaximumLength(500).WithMessage("La descripción no puede superar 500 caracteres.")
            .When(x => x.Descripcion is not null);

        RuleFor(x => x.Orden)
            .GreaterThan(0).WithMessage("El orden debe ser mayor a 0.");
    }
}

// ─── Handler ─────────────────────────────────────────────────────────────────

public sealed class CrearChecklistCommandHandler : IRequestHandler<CrearChecklistCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;

    public CrearChecklistCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(
        CrearChecklistCommand request,
        CancellationToken cancellationToken)
    {
        // Verificar si ya existe un checklist activo para esta categoría
        var checklistExistente = await _unitOfWork.Checklists.GetActivoByCategoriaAsync(request.CategoriaId);

        // Calcular versión — si ya existe uno, la nueva versión es la siguiente
        var version = checklistExistente is not null ? checklistExistente.Version + 1 : 1;

        // Desactivar el checklist anterior si existe
        if (checklistExistente is not null)
        {
            checklistExistente.Estado = false;
            _unitOfWork.Checklists.Update(checklistExistente);
        }

        var checklist = new ChecklistBPM
        {
            Nombre = request.Nombre.Trim(),
            CategoriaId = request.CategoriaId,
            Version = version,
            Estado = true,
            CreadoEn = DateTime.UtcNow
        };

        // Agregar ítems ordenados
        foreach (var item in request.Items.OrderBy(i => i.Orden))
        {
            checklist.Items.Add(new ItemChecklist
            {
                Criterio = item.Criterio.Trim(),
                Descripcion = item.Descripcion?.Trim(),
                EsCritico = item.EsCritico,
                Orden = item.Orden
            });
        }

        await _unitOfWork.Checklists.AddAsync(checklist);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return checklist.Id;
    }
}