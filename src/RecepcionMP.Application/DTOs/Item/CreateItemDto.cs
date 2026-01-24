namespace RecepcionMP.Application.DTOs.Item
{
    public class CreateItemDto
    {
        public string Nombre { get; set; }
        public int CategoriaId { get; set; }
        public string UnidadMedida { get; set; }
        public int VidaUtilDias { get; set; }
        public decimal? TemperaturaObjetivo { get; set; }
    }
}