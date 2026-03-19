using SistemaRecepcionMP.Application.Common.Exceptions;
using SistemaRecepcionMP.Application.Common.Mappings;
using AutoMapper;
using SistemaRecepcionMP.Domain.Interfaces;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.CheckList.Queries;

// ─── GetChecklistsList ────────────────────────────────────────────────────────

public record GetChecklistsListQuery : IRequest<IEnumerable<ChecklistBPMDto>>;

public sealed class GetChecklistsListQueryHandler
    : IRequestHandler<GetChecklistsListQuery, IEnumerable<ChecklistBPMDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetChecklistsListQueryHandler(IUnitOfWork unitOfWork)
        => _unitOfWork = unitOfWork;

    public async Task<IEnumerable<ChecklistBPMDto>> Handle(
        GetChecklistsListQuery request, CancellationToken cancellationToken)
    {
        var checklists = await _unitOfWork.Checklists.GetAllConItemsAsync();
        return checklists.Select(c => new ChecklistBPMDto
        {
            Id              = c.Id,
            Nombre          = c.Nombre,
            CategoriaId     = c.CategoriaId,
            CategoriaNombre = c.Categoria.Nombre,
            Version         = c.Version,
            Estado          = c.Estado,
            CreadoEn        = c.CreadoEn,
            TotalCriterios  = c.Items.Count,
            Obligatorios    = c.Items.Count(i => i.EsCritico),
            Items           = new List<ItemChecklistDto>(),
        });
    }
}

// ─── GetChecklistById ─────────────────────────────────────────────────────────

public record GetChecklistByIdQuery(Guid Id) : IRequest<ChecklistBPMDto>;

public sealed class GetChecklistByIdQueryHandler
    : IRequestHandler<GetChecklistByIdQuery, ChecklistBPMDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetChecklistByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ChecklistBPMDto> Handle(
        GetChecklistByIdQuery request, CancellationToken cancellationToken)
    {
        var checklist = await _unitOfWork.Checklists.GetByIdConItemsAsync(request.Id)
            ?? throw new ValidationException("Id",
                $"No se encontró el checklist con ID '{request.Id}'.");
        return _mapper.Map<ChecklistBPMDto>(checklist);
    }
}

// ─── GetChecklistByCategoria ──────────────────────────────────────────────────

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