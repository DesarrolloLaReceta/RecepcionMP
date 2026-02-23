using SistemaRecepcionMP.Application.Common.Mappings;
using AutoMapper;
using SistemaRecepcionMP.Domain.Interfaces;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Items.Queries;

public sealed class GetItemsByCategoriaQuery : IRequest<IEnumerable<ItemResumenDto>>
{
    public Guid CategoriaId { get; set; }
    public GetItemsByCategoriaQuery(Guid categoriaId) => CategoriaId = categoriaId;
}

public sealed class GetItemsByCategoriaQueryHandler
    : IRequestHandler<GetItemsByCategoriaQuery, IEnumerable<ItemResumenDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetItemsByCategoriaQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ItemResumenDto>> Handle(
        GetItemsByCategoriaQuery request,
        CancellationToken cancellationToken)
    {
        var items = await _unitOfWork.Items.GetByCategoriaAsync(request.CategoriaId);

        return _mapper.Map<IEnumerable<ItemResumenDto>>(items);
    }
}