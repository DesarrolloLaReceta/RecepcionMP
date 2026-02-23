using SistemaRecepcionMP.Application.Common.Mappings;
using AutoMapper;
using SistemaRecepcionMP.Domain.Interfaces;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Proveedores.Queries.GetDocumentosPorVencer;

public sealed class GetDocumentosPorVencerQueryHandler
    : IRequestHandler<GetDocumentosPorVencerQuery, IEnumerable<DocumentoPorVencerDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetDocumentosPorVencerQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<DocumentoPorVencerDto>> Handle(
        GetDocumentosPorVencerQuery request,
        CancellationToken cancellationToken)
    {
        var documentos = await _unitOfWork.Proveedores
            .GetDocumentosProximosAVencerAsync(request.DiasUmbral);

        // Ordenar de más urgente a menos urgente
        var documentosOrdenados = documentos
            .OrderBy(d => d.DiasParaVencer);

        return _mapper.Map<IEnumerable<DocumentoPorVencerDto>>(documentosOrdenados);
    }
}