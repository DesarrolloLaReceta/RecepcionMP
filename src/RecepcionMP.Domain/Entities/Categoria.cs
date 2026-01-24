namespace RecepcionMP.Domain.Entities
{
    /// <summary>
    /// Clasificación sanitaria de alimentos/ingredientes
    /// Resol. 2674/2013 - BPM
    /// </summary>
    public class Categoria
    {
        public int Id { get; set; }
        public string Nombre { get; set; } // Ej: "Cárnicos", "Lácteos", "Secos", "Frutas/Verduras", "Congelados"
        public string Descripcion { get; set; }
        public TipoAlimento TipoAlimento { get; set; }
        public bool Activo { get; set; } = true;
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        // Relaciones
        public ICollection<Item> Items { get; set; } = new List<Item>();
        public ICollection<DocumentoRequerido> DocumentosRequeridos { get; set; } = new List<DocumentoRequerido>();
        public ICollection<CheckListBPMCategoria> CheckListsVersionados { get; set; } = new List<CheckListBPMCategoria>();
    }

    public enum TipoAlimento
    {
        Carnico = 1,
        Lacteo = 2,
        Seco = 3,
        FrutasVerduras = 4,
        Congelado = 5,
        Bebidas = 6,
        OtroProcessado = 7
    }
}