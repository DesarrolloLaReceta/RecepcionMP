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
        var checklist = await _unitOfWork.Checklists.GetByIdConItemsAsync(request.ChecklistId)
            ?? throw new KeyNotFoundException($"Checklist {request.ChecklistId} no encontrado.");

        // Elimina los ítems anteriores y reemplaza
        checklist.Items.Clear();
        foreach (var c in request.Criterios.OrderBy(c => c.Orden))
        {
            checklist.Items.Add(new ItemChecklist
            {
                Criterio    = c.Criterio.Trim(),
                Descripcion = c.Descripcion?.Trim(),
                EsCritico   = c.EsCritico,
                Orden       = c.Orden,
                TipoCriterio = c.TipoCriterio,
                ValorMinimo = c.ValorMinimo,
                ValorMaximo = c.ValorMaximo,
                Unidad      = c.Unidad,
            });
        }

        _unitOfWork.Checklists.Update(checklist);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}