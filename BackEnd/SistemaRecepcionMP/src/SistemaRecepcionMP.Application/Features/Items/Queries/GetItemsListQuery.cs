using SistemaRecepcionMP.Application.Common.Mappings;
using AutoMapper;
using SistemaRecepcionMP.Domain.Interfaces;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Items.Queries;

public sealed class GetItemsListQuery : IRequest<IEnumerable<ItemResumenDto>>
{
    public bool SoloActivos { get; set; } = true;
}

public sealed class GetItemsListQueryHandler : IRequestHandler<GetItemsListQuery, IEnumerable<ItemResumenDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetItemsListQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ItemResumenDto>> Handle(
        GetItemsListQuery request,
        CancellationToken cancellationToken)
    {
        var items = await _unitOfWork.Items.GetAllConCategoriaAsync();

        if (request.SoloActivos)
            items = items.Where(i => i.Estado);

        return _mapper.Map<IEnumerable<ItemResumenDto>>(items);
    }
}