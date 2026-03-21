using MediatR;
using SistemaRecepcionMP.Application.Common.Behaviours;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Interfaces;

namespace SistemaRecepcionMP.Application.Features.Checklists.Commands;

public sealed class ActualizarCriteriosCommand : IRequest, IAuditableCommand
{
    public Guid ChecklistId { get; set; }
    public List<CriterioRequest> Criterios { get; set; } = new();

    public string EntidadAfectada => "ChecklistBPM";
    public string RegistroId => ChecklistId.ToString();
}

public sealed class CriterioRequest
{
    public string Criterio { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public bool EsCritico { get; set; }
    public int Orden { get; set; }
    public TipoCriterio TipoCriterio { get; set; } = TipoCriterio.SiNo;
    public decimal? ValorMinimo { get; set; }
    public decimal? ValorMaximo { get; set; }
    public string? Unidad { get; set; }
}

public sealed class ActualizarCriteriosCommandHandler : IRequestHandler<ActualizarCriteriosCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public ActualizarCriteriosCommandHandler(IUnitOfWork unitOfWork)
        => _unitOfWork = unitOfWork;

    public async Task Handle(ActualizarCriteriosCommand request, CancellationToken cancellationToken)
    {
        if (!await _unitOfWork.Checklists.ExisteAsync(request.ChecklistId))
            throw new KeyNotFoundException($"Checklist {request.ChecklistId} no encontrado.");

        await _unitOfWork.Checklists.RemoverItemsAsync(request.ChecklistId);

        var nuevosItems = request.Criterios
            .OrderBy(c => c.Orden)
            .Select(c => new ItemChecklist
            {
                ChecklistId  = request.ChecklistId,
                Criterio     = c.Criterio.Trim(),
                Descripcion  = c.Descripcion?.Trim(),
                EsCritico    = c.EsCritico,
                Orden        = c.Orden,
                TipoCriterio = c.TipoCriterio,
                ValorMinimo  = c.ValorMinimo,
                ValorMaximo  = c.ValorMaximo,
                Unidad       = c.Unidad,
            })
            .ToList();

        await _unitOfWork.Checklists.AgregarItemsAsync(nuevosItems);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}