using System.Text.Json;

namespace RecepcionMP.Domain.Entities
{
    /// <summary>
    /// Template versionable de checklists BPM por categoría
    /// Permite auditar cambios de criterios a lo largo del tiempo
    /// </summary>
    public class CheckListBPMCategoria
    {
        public int Id { get; set; }
        public int CategoriaId { get; set; }
        public int Versión { get; set; } = 1;
        public DateTime FechaVigencia { get; set; } = DateTime.UtcNow;
        public bool EsVigente { get; set; } = true;
        public string Descripcion { get; set; }
        
        // Criterios almacenados como JSON para flexibilidad
        // Ej: [{"nombre": "Olor", "critico": true, "aceptable": "Sin olor anómalo"}]
        public string CriteriosJSON { get; set; }

        public Categoria Categoria { get; set; }

        // Método helper para obtener criterios
        public List<CriterioBPM> ObtenerCriterios()
        {
            if (string.IsNullOrEmpty(CriteriosJSON))
                return new List<CriterioBPM>();
            
            return JsonSerializer.Deserialize<List<CriterioBPM>>(CriteriosJSON) 
                   ?? new List<CriterioBPM>();
        }

        // Método helper para establecer criterios
        public void EstablecerCriterios(List<CriterioBPM> criterios)
        {
            CriteriosJSON = JsonSerializer.Serialize(criterios);
        }
    }

    public class CriterioBPM
    {
        public string Nombre { get; set; }
        public bool EsCritico { get; set; } // Si falla, rechaza automáticamente
        public string Descripcion { get; set; }
        public string CriterioAceptacion { get; set; }
    }
}