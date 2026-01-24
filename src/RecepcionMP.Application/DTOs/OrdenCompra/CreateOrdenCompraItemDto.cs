namespace RecepcionMP.Application.DTOs.OrdenCompra
{
    public class CreateOrdenCompraItemDto
    {
        public int ItemId { get; set; }
        public decimal CantidadEsperada { get; set; }
        public string UnidadMedida { get; set; } = string.Empty;
    }
}
