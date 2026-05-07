namespace SistemaRecepcionMP.Application.Common.Interfaces;

public interface ISiesaService
{
    Task<IReadOnlyCollection<SiesaCantidadItem>> ObtenerCantidadesEsperadasAsync(
        Guid ordenCompraId,
        CancellationToken cancellationToken = default);
}

public sealed record SiesaCantidadItem(
    Guid ItemId,
    decimal CantidadSiesa,
    string UnidadMedida
);
