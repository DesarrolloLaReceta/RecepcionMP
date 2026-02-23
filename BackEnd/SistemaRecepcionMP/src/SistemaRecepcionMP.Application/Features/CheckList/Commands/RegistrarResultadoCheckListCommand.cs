using SistemaRecepcionMP.Application.Common.Behaviours;
using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Exceptions.Lotes;
using SistemaRecepcionMP.Domain.Interfaces;
using FluentValidation;
using MediatR;
using AppValidationException = SistemaRecepcionMP.Application.Common.Exceptions.ValidationException;

namespace SistemaRecepcionMP.Application.Features.Checklists.Commands;

// ─── Command ────────────────────────────────────────────────────────────────

public sealed class RegistrarResultadoChecklistCommand : IRequest, IAuditableCommand
{
    public Guid LoteRecibidoId { get; set; }
    public Guid ChecklistId { get; set; }
    public List<ResultadoItemRequest> Resultados { get; set; } = new();

    // IAuditableCommand
    public string EntidadAfectada => "ResultadoChecklist";
    public string RegistroId => LoteRecibidoId.ToString();
}

public sealed class ResultadoItemRequest
{
    public Guid ItemChecklistId { get; set; }
    public ResultadoItem Resultado { get; set; }
    public string? Observacion { get; set; }
}

// ─── Validator ───────────────────────────────────────────────────────────────

public sealed class RegistrarResultadoChecklistCommandValidator
    : AbstractValidator<RegistrarResultadoChecklistCommand>
{
    public RegistrarResultadoChecklistCommandValidator()
    {
        RuleFor(x => x.LoteRecibidoId)
            .NotEmpty().WithMessage("El lote es obligatorio.");

        RuleFor(x => x.ChecklistId)
            .NotEmpty().WithMessage("El checklist es obligatorio.");

        RuleFor(x => x.Resultados)
            .NotEmpty().WithMessage("Debe registrar al menos un resultado.")
            .Must(r => r.Select(i => i.ItemChecklistId).Distinct().Count() == r.Count)
            .WithMessage("No se puede repetir el mismo ítem del checklist.");

        RuleForEach(x => x.Resultados).SetValidator(new ResultadoItemRequestValidator());
    }
}

public sealed class ResultadoItemRequestValidator : AbstractValidator<ResultadoItemRequest>
{
    public ResultadoItemRequestValidator()
    {
        RuleFor(x => x.ItemChecklistId)
            .NotEmpty().WithMessage("El ítem del checklist es obligatorio.");

        RuleFor(x => x.Resultado)
            .IsInEnum().WithMessage("El resultado no es válido.");

        RuleFor(x => x.Observacion)
            .NotEmpty().WithMessage("La observación es obligatoria cuando el ítem no cumple.")
            .When(x => x.Resultado == ResultadoItem.NoCumple);

        RuleFor(x => x.Observacion)
            .MaximumLength(300).WithMessage("La observación no puede superar 300 caracteres.")
            .When(x => x.Observacion is not null);
    }
}

// ─── Handler ─────────────────────────────────────────────────────────────────

public sealed class RegistrarResultadoChecklistCommandHandler
    : IRequestHandler<RegistrarResultadoChecklistCommand>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public RegistrarResultadoChecklistCommandHandler(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task Handle(
        RegistrarResultadoChecklistCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Verificar lote existe y está en estado válido
        var lote = await _unitOfWork.Lotes.GetByIdAsync(request.LoteRecibidoId)
            ?? throw new LoteNotFoundException(request.LoteRecibidoId);

        if (lote.Estado == EstadoLote.Liberado)
            throw new LoteYaLiberadoException(lote.CodigoLoteInterno);

        // 2. Verificar checklist existe y está activo
        var checklist = await _unitOfWork.Checklists.GetByIdAsync(request.ChecklistId)
            ?? throw new AppValidationException("ChecklistId",
                $"No se encontró el checklist con ID '{request.ChecklistId}'.");

        if (!checklist.Estado)
            throw new AppValidationException("ChecklistId",
                $"El checklist '{checklist.Nombre}' está inactivo.");

        // 3. Verificar que se registraron todos los ítems obligatorios del checklist
        var itemsChecklist = checklist.Items.Select(i => i.Id).ToHashSet();
        var itemsRegistrados = request.Resultados.Select(r => r.ItemChecklistId).ToHashSet();
        var itemsFaltantes = itemsChecklist.Except(itemsRegistrados).ToList();

        if (itemsFaltantes.Any())
            throw new AppValidationException("Resultados",
                $"Faltan {itemsFaltantes.Count} ítems del checklist por registrar.");

        // 4. Detectar ítems críticos con resultado NoCumple
        var itemsCriticosNoCumplen = request.Resultados
            .Where(r => r.Resultado == ResultadoItem.NoCumple)
            .Join(checklist.Items,
                r => r.ItemChecklistId,
                i => i.Id,
                (r, i) => new { Item = i, Resultado = r })
            .Where(x => x.Item.EsCritico)
            .ToList();

        // 5. Registrar todos los resultados
        foreach (var resultado in request.Resultados)
        {
            var resultadoChecklist = new ResultadoChecklist
            {
                LoteRecibidoId = lote.Id,
                ChecklistId = request.ChecklistId,
                ItemChecklistId = resultado.ItemChecklistId,
                Resultado = resultado.Resultado,
                Observacion = resultado.Observacion?.Trim(),
                RegistradoPor = _currentUser.UserId,
                FechaRegistro = DateTime.UtcNow
            };

            lote.ResultadosChecklist.Add(resultadoChecklist);
        }

        // 6. Si hay ítems críticos que no cumplen, poner lote en cuarentena automáticamente
        if (itemsCriticosNoCumplen.Any())
        {
            lote.PonerEnCuarentena();

            var criterios = string.Join(", ", itemsCriticosNoCumplen.Select(x => x.Item.Criterio));
            var cuarentena = new Cuarentena
            {
                LoteRecibidoId = lote.Id,
                FechaCuarentena = DateOnly.FromDateTime(DateTime.UtcNow),
                Motivo = $"Checklist BPM: ítems críticos no cumplen — {criterios}",
                SeguidoPor = _currentUser.UserId
            };

            lote.AgregarCuarentena(cuarentena);
        }

        _unitOfWork.Lotes.Update(lote);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}