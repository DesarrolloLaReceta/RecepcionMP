namespace RecepcionMP.Application.DTOs.OrdenCompra
{
    public class CreateOrdenCompraDto
    {
        public string NumeroOrden { get; set; } = string.Empty;
        public DateTime FechaOrden { get; set; }
        public int ProveedorId { get; set; }

        public List<CreateOrdenCompraItemDto> Items { get; set; }
            = new();
    }
}
