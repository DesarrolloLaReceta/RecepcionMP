public class CreateCheckListBPMDto
{
    public int RecepcionId { get; set; }
    public string? ObservacionesGenerales { get; set; }
    public List<CreateCheckListItemDto> Items { get; set; } = [];
}
