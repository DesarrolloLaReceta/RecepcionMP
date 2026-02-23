using SistemaRecepcionMP.Application.Common.Mappings;
using AutoMapper;
using SistemaRecepcionMP.Domain.Interfaces;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Items.Queries;

public sealed class GetItemByIdQuery : IRequest<ItemDetalleDto>
{
    public Guid Id { get; set; }
    public GetItemByIdQuery(Guid id) => Id = id;
}

public sealed class GetItemByIdQueryHandler : IRequestHandler<GetItemByIdQuery, ItemDetalleDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetItemByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ItemDetalleDto> Handle(
        GetItemByIdQuery request,
        CancellationToken cancellationToken)
    {
        var item = await _unitOfWork.Items.GetByIdAsync(request.Id)
            ?? throw new SistemaRecepcionMP.Application.Common.Exceptions.ValidationException(
                "Id", $"No se encontró el ítem con ID '{request.Id}'.");

        return _mapper.Map<ItemDetalleDto>(item);
    }
}