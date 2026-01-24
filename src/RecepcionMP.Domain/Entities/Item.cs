namespace RecepcionMP.Domain.Entities
{
    public class Item
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        
        // AGREGAR:
        public int CategoriaId { get; set; }
        public string UnidadMedida { get; set; } = string.Empty;
        public string CategoriaSanitaria { get; set; } = string.Empty;
        public int VidaUtilDias { get; set; } // Días de vida útil desde fabricación
        public decimal? TemperaturaObjetivo { get; set; } // °C para refrigerados
        public decimal? TemperaturaMinima { get; set; }
        public decimal? TemperaturaMaxima { get; set; }
        public int VidaUtilMinimaAceptable { get; set; } = 30; // Días mínimos al recibir
        
        public bool Activo { get; set; } = true;
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        // Relaciones
        public Categoria Categoria { get; set; }
        public ICollection<Lote> Lotes { get; set; } = new List<Lote>();
    }
}
