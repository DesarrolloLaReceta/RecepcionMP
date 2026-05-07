namespace SistemaRecepcionMP.Domain.Entities;

public class RecepcionNovedadDetalle : BaseEntity
{
    public Guid RecepcionNovedadId { get; private set; }
    public RecepcionNovedad RecepcionNovedad { get; private set; } = null!;

    public Guid RecepcionItemId { get; private set; }
    public RecepcionItem RecepcionItem { get; private set; } = null!;

    public Guid ItemId { get; private set; }
    public Item Item { get; private set; } = null!;

    public decimal CantidadFisica { get; private set; }
    public decimal CantidadSiesa { get; private set; }
    public decimal Diferencia { get; private set; }
    public string UnidadMedida { get; private set; } = string.Empty;

    public RecepcionNovedadDetalle() { }

    public RecepcionNovedadDetalle(
        Guid recepcionNovedadId,
        Guid recepcionItemId,
        Guid itemId,
        decimal cantidadFisica,
        decimal cantidadSiesa,
        string unidadMedida)
    {
        RecepcionNovedadId = recepcionNovedadId;
        RecepcionItemId = recepcionItemId;
        ItemId = itemId;
        CantidadFisica = cantidadFisica;
        CantidadSiesa = cantidadSiesa;
        Diferencia = cantidadFisica - cantidadSiesa;
        UnidadMedida = unidadMedida;
    }
}
