using SistemaRecepcionMP.Domain.Interfaces;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.NoConformidades.Queries;

public sealed class GetCausalesNCQuery : IRequest<IEnumerable<CausalNCDto>> { }

public sealed class CausalNCDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public int TipoAccionSugerida { get; set; }
}

public sealed class GetCausalesNCQueryHandler
    : IRequestHandler<GetCausalesNCQuery, IEnumerable<CausalNCDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    public GetCausalesNCQueryHandler(IUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<IEnumerable<CausalNCDto>> Handle(
        GetCausalesNCQuery request, CancellationToken cancellationToken)
    {
        var causales = await _unitOfWork.NoConformidades.GetCausalesAsync();
        return causales.Select(c => new CausalNCDto
        {
            Id                 = c.Id,
            Nombre             = c.Nombre,
            Descripcion        = c.Descripcion,
            TipoAccionSugerida = (int)c.TipoAccionSugerida
        });
    }
}