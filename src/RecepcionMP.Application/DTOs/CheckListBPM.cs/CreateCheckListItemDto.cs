public class CreateCheckListItemDto
{
    public string Nombre { get; set; } = null!;
    public bool EsConforme { get; set; }
    public bool EsCritico { get; set; }
    public string? Observacion { get; set; }
}
