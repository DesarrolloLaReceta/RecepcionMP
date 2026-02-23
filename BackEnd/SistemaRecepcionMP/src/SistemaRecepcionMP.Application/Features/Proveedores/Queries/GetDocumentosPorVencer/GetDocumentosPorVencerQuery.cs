using SistemaRecepcionMP.Application.Common.Mappings;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Proveedores.Queries.GetDocumentosPorVencer;

public sealed class GetDocumentosPorVencerQuery : IRequest<IEnumerable<DocumentoPorVencerDto>>
{
    /// <summary>
    /// Días de anticipación para considerar un documento "por vencer".
    /// Por defecto 30 días.
    /// </summary>
    public int DiasUmbral { get; set; } = 30;
}