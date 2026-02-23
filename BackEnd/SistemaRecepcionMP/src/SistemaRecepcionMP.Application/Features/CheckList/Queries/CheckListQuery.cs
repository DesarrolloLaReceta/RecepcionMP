using SistemaRecepcionMP.Application.Common.Exceptions;
using SistemaRecepcionMP.Application.Common.Mappings;
using AutoMapper;
using SistemaRecepcionMP.Domain.Interfaces;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Checklists.Queries;

// ─── GetChecklistByCategoria ─────────────────────────────────────────────────

public sealed class GetChecklistByCategoriaQuery : IRequest<ChecklistBPMDto>
{
    public Guid CategoriaId { get; set; }
    public GetChecklistByCategoriaQuery(Guid categoriaId) => CategoriaId = categoriaId;
}

public sealed class GetChecklistByCategoriaQueryHandler
    : IRequestHandler<GetChecklistByCategoriaQuery, ChecklistBPMDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetChecklistByCategoriaQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ChecklistBPMDto> Handle(
        GetChecklistByCategoriaQuery request,
        CancellationToken cancellationToken)
    {
        var checklist = await _unitOfWork.Checklists.GetActivoByCategoriaAsync(request.CategoriaId)
            ?? throw new ValidationException("CategoriaId",
                $"No hay un checklist BPM activo para la categoría '{request.CategoriaId}'.");

        return _mapper.Map<ChecklistBPMDto>(checklist);
    }
}

// ─── GetResultadosByLote ──────────────────────────────────────────────────────

public sealed class GetResultadosByLoteQuery : IRequest<IEnumerable<ResultadoChecklistDto>>
{
    public Guid LoteRecibidoId { get; set; }
    public GetResultadosByLoteQuery(Guid loteRecibidoId) => LoteRecibidoId = loteRecibidoId;
}

public sealed class GetResultadosByLoteQueryHandler
    : IRequestHandler<GetResultadosByLoteQuery, IEnumerable<ResultadoChecklistDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetResultadosByLoteQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ResultadoChecklistDto>> Handle(
        GetResultadosByLoteQuery request,
        CancellationToken cancellationToken)
    {
        var lote = await _unitOfWork.Lotes.GetByIdAsync(request.LoteRecibidoId)
            ?? throw new ValidationException("LoteRecibidoId",
                $"No se encontró el lote con ID '{request.LoteRecibidoId}'.");

        return _mapper.Map<IEnumerable<ResultadoChecklistDto>>(
            lote.ResultadosChecklist.OrderBy(r => r.ItemChecklist?.Orden));
    }
}