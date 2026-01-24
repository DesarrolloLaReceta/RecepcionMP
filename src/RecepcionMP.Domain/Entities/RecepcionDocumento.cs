namespace RecepcionMP.Domain.Entities
{
    /// <summary>
    /// Vinculación de documentos adjuntos a una recepción
    /// </summary>
    public class RecepcionDocumento
    {
        public int Id { get; set; }
        public int RecepcionId { get; set; }
        public int DocumentoRequeridoId { get; set; }
        
        public string NombreArchivo { get; set; }
        public string RutaAlmacenamiento { get; set; } // URI del blob o path local
        public string Hash { get; set; } // SHA256 para integridad
        public long TamañoBytes { get; set; }
        public string TipoMime { get; set; } // application/pdf, image/jpeg
        
        public DateTime FechaCarga { get; set; } = DateTime.UtcNow;
        public string CargadoPor { get; set; } // UserId
        
        public EstadoDocumento Estado { get; set; } = EstadoDocumento.Pendiente;
        public string ObservacionesValidacion { get; set; }
        
        // Relaciones
        public Recepcion Recepcion { get; set; }
        public DocumentoRequerido DocumentoRequerido { get; set; }
    }

    public enum EstadoDocumento
    {
        Pendiente = 1,
        Recibido = 2,
        ValidadoOK = 3,
        RechazadoFormato = 4,
        RechazadoContenido = 5,
        Vencido = 6
    }
}