using System;
using System.Collections.Generic;

namespace SistemaRecepcionMP.Domain.Entities
{
    public class LiberacionCocina
    {
        public int Id { get; set; }
        public DateTime Fecha { get; set; } = DateTime.Now;
        public string Turno { get; set; } = string.Empty;
        public string Cocina { get; set; } = string.Empty;
        
        // Relación con los ítems de inspección
        public List<DetalleInspeccionCocina> Detalles { get; set; } = new();
        
        public string ObservacionesInspeccion { get; set; } = string.Empty;
        public string NombreResponsable { get; set; } = string.Empty;
        public string CargoResponsable { get; set; } = string.Empty;
        public string ObservacionesGenerales { get; set; } = string.Empty;
    }

    public class DetalleInspeccionCocina
    {
        public int Id { get; set; }
        public int LiberacionCocinaId { get; set; }
        public string Item { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty; // "Cumple", "No cumple", "No aplica"
    }
}