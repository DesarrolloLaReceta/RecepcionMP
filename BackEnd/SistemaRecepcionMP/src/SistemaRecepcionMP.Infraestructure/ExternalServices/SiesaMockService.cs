using Microsoft.Extensions.Configuration;
using SistemaRecepcionMP.Application.Common.Interfaces;

namespace SistemaRecepcionMP.Infrastructure.ExternalServices;

public sealed class SiesaMockService : ISiesaService
{
    private readonly IConfiguration _configuration;

    public SiesaMockService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public Task<IReadOnlyCollection<SiesaCantidadItem>> ObtenerCantidadesEsperadasAsync(
        Guid ordenCompraId,
        CancellationToken cancellationToken = default)
    {
        var section = _configuration.GetSection("SiesaMock:CantidadesEsperadas");
        var dataset = section.Get<List<SiesaMockCantidadRow>>() ?? [];

        var result = dataset
            .Where(x => x.OrdenCompraId == ordenCompraId)
            .Select(x => new SiesaCantidadItem(x.ItemId, x.CantidadSiesa, x.UnidadMedida))
            .ToList()
            .AsReadOnly();

        return Task.FromResult<IReadOnlyCollection<SiesaCantidadItem>>(result);
    }
}

public sealed class SiesaMockCantidadRow
{
    public Guid OrdenCompraId { get; set; }
    public Guid ItemId { get; set; }
    public decimal CantidadSiesa { get; set; }
    public string UnidadMedida { get; set; } = string.Empty;
}
