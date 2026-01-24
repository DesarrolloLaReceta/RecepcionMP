public class CheckListBPM
{
    public int Id { get; private set; }
    public int RecepcionId { get; private set; }

    public Recepcion Recepcion { get; private set; } = null!;

    public DateTime Fecha { get; private set; }
    public string? ObservacionesGenerales { get; private set; }

    public List<CheckListItem> Items { get; set; } = new();

    private CheckListBPM() { }

    public CheckListBPM(int recepcionId)
    {
        RecepcionId = recepcionId;
        Fecha = DateTime.UtcNow;
    }

    public bool EsAprobado()
        => Items.All(i => i.EsConforme || !i.EsCritico);
}
