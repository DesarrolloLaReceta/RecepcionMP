namespace RecepcionMP.Application.DTOs.OrdenCompra
{
    public class ReadOrdenCompraItemDto
    {
        public string Item { get; set; } = string.Empty;
        public decimal CantidadEsperada { get; set; }
        public string UnidadMedida { get; set; } = string.Empty;
    }
}
