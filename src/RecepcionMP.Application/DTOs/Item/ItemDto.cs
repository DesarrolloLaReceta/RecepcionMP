namespace RecepcionMP.Application.DTOs.Item
{
    public class ItemDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public int CategoriaId { get; set; }
        public string UnidadMedida { get; set; }
        public int VidaUtilDias { get; set; }
        public decimal? TemperaturaObjetivo { get; set; }
    }
}