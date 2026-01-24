namespace RecepcionMP.Application.DTOs.OrdenCompra
{
    public class ReadOrdenCompraDto
    {
        public int Id { get; set; }
        public string NumeroOrden { get; set; } = string.Empty;
        public DateTime FechaOrden { get; set; }
        public string Proveedor { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;

        public List<ReadOrdenCompraItemDto> Items { get; set; }
            = new();
    }
}
