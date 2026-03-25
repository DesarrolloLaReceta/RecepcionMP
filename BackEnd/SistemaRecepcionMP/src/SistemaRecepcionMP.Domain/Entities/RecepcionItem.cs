namespace SistemaRecepcionMP.Domain.Entities;

public class RecepcionItem : BaseEntity
{
    public Guid RecepcionId { get; private set; }
    public Guid DetalleOrdenCompraId { get; private set; }

    public decimal CantidadEsperada { get; private set; }
    public decimal CantidadRecibida { get; private set; }
    public decimal CantidadRechazada { get; private set; }

    public string UnidadMedida { get; private set; } = string.Empty;

    // Navegación
    public Recepcion Recepcion { get; private set; } = null!;
    public DetalleOrdenCompra DetalleOrdenCompra { get; private set; } = null!;

    public ICollection<LoteRecibido> Lotes { get; private set; } = new List<LoteRecibido>();

    // MÉTODOS DE NEGOCIO

    public void AgregarLote(LoteRecibido lote)
    {
        Lotes.Add(lote);
        RecalcularCantidades();
    }

    private void RecalcularCantidades()
    {
        CantidadRecibida = Lotes.Sum(x => x.CantidadRecibida);
        CantidadRechazada = Lotes.Sum(x => x.CantidadRechazada);

        if (CantidadRecibida > CantidadEsperada)
            throw new Exception("No puedes recibir más de lo solicitado");
    }
}