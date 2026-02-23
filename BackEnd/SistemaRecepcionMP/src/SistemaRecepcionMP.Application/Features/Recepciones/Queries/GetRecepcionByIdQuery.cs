using SistemaRecepcionMP.Application.Common.Mappings;
using AutoMapper;
using SistemaRecepcionMP.Domain.Exceptions.Recepciones;
using SistemaRecepcionMP.Domain.Interfaces;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Queries;

public sealed class GetRecepcionByIdQuery : IRequest<RecepcionDetalleDto>
{
    public Guid Id { get; set; }
    public GetRecepcionByIdQuery(Guid id) => Id = id;
}

public sealed class GetRecepcionByIdQueryHandler
    : IRequestHandler<GetRecepcionByIdQuery, RecepcionDetalleDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetRecepcionByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<RecepcionDetalleDto> Handle(
        GetRecepcionByIdQuery request,
        CancellationToken cancellationToken)
    {
        // GetWithLotesAsync trae recepción + lotes + documentos + temperaturas en un solo query
        var recepcion = await _unitOfWork.Recepciones.GetWithLotesAsync(request.Id)
            ?? throw new RecepcionNotFoundException(request.Id);

        return _mapper.Map<RecepcionDetalleDto>(recepcion);
    }
}