public class CheckListItem
{
    public int Id { get; private set; }

    public int CheckListBPMId { get; private set; }
    public CheckListBPM CheckListBPM { get; private set; } = null!;
    public string Nombre { get; private set; }
    public bool EsConforme { get; private set; }
    public bool EsCritico { get; private set; }
    public string? Observacion { get; private set; }

    private CheckListItem() { }

    public CheckListItem(string nombre, bool esConforme, bool esCritico, string? observacion)
    {
        Nombre = nombre;
        EsConforme = esConforme;
        EsCritico = esCritico;
        Observacion = observacion;
    }
}
