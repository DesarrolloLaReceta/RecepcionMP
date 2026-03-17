using AutoMapper;
using MediatR;
using SistemaRecepcionMP.Application.Common.Mappings;
using SistemaRecepcionMP.Domain.Interfaces;

namespace SistemaRecepcionMP.Application.Features.Checklists.Queries;

public record GetChecklistsListQuery : IRequest<IEnumerable<ChecklistBPMDto>>;

public sealed class GetChecklistsListQueryHandler
    : IRequestHandler<GetChecklistsListQuery, IEnumerable<ChecklistBPMDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetChecklistsListQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ChecklistBPMDto>> Handle(
        GetChecklistsListQuery request, CancellationToken cancellationToken)
    {
        var checklists = await _unitOfWork.Checklists.GetAllConItemsAsync();
        return _mapper.Map<IEnumerable<ChecklistBPMDto>>(checklists);
    }
}

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
            ?? throw new KeyNotFoundException($"Checklist {request.Id} no encontrado.");
        return _mapper.Map<ChecklistBPMDto>(checklist);
    }
}