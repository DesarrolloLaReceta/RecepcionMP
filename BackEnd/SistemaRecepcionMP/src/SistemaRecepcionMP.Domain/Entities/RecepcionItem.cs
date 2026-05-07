using System.Diagnostics.CodeAnalysis;
using SistemaRecepcionMP.Domain.Exceptions;

namespace SistemaRecepcionMP.Domain.Entities;

public class RecepcionItem : BaseEntity
{
    public Guid RecepcionId { get; private set; }
    public Guid DetalleOrdenCompraId { get; private set; }
    public Guid ItemId { get; private set; }
    public Item? Item { get; private set; } = null!;

    public decimal CantidadEsperada { get; private set; }
    public decimal CantidadRecibida { get; private set; }
    public decimal CantidadRechazada { get; private set; }
    public decimal CantidadAceptada => CantidadRecibida - CantidadRechazada;

    public string UnidadMedida { get; private set; } = string.Empty;

    // Navegación
    public Recepcion Recepcion { get; private set; } = null!;
    public DetalleOrdenCompra DetalleOrdenCompra { get; private set; } = null!;

    private readonly List<LoteRecibido> _lotes = new();

    public IReadOnlyCollection<LoteRecibido> Lotes => _lotes;

    public RecepcionItem(
        Guid recepcionId,
        Guid detalleOrdenCompraId,
        decimal cantidadEsperada,
        string unidadMedida)
    {
        if (cantidadEsperada <= 0)
            throw new BusinessRuleException("La cantidad esperada debe ser mayor a 0");

        if (string.IsNullOrWhiteSpace(unidadMedida))
            throw new BusinessRuleException("La unidad de medida es obligatoria");

        RecepcionId = recepcionId;
        DetalleOrdenCompraId = detalleOrdenCompraId;
        CantidadEsperada = cantidadEsperada;
        UnidadMedida = unidadMedida;
    }

    // MÉTODOS DE NEGOCIO

    public void AgregarLote(LoteRecibido lote)
    {
        if (lote is null)
            throw new ArgumentNullException(nameof(lote));

        if (lote.CantidadRecibida <= 0)
            throw new BusinessRuleException("El lote debe tener cantidad recibida mayor a 0");

        if (lote.CantidadRechazada < 0)
            throw new BusinessRuleException("La cantidad rechazada no puede ser negativa");

        if (lote.CantidadRechazada > lote.CantidadRecibida)
            throw new BusinessRuleException("No puedes rechazar más de lo recibido");

        if (lote.UnidadMedida != UnidadMedida)
            throw new BusinessRuleException("La unidad de medida del lote no coincide");

        if (Lotes.Any(x => x.CodigoLoteInterno == lote.CodigoLoteInterno))
            throw new BusinessRuleException("El lote ya fue agregado");

        _lotes.Add(lote);

        RecalcularCantidades();
    }

    private void RecalcularCantidades()
    {
        CantidadRecibida = Lotes.Sum(x => x.CantidadRecibida);
        CantidadRechazada = Lotes.Sum(x => x.CantidadRechazada);

    }
}