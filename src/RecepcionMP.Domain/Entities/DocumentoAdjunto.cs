using System;

namespace RecepcionMP.Domain.Entities
{
    /// <summary>
    /// Metadatos físicos del archivo adjunto a un documento
    /// Proporciona trazabilidad de almacenamiento e integridad
    /// </summary>
    public class DocumentoAdjunto
    {
        public int Id { get; set; }
        public int RecepcionDocumentoId { get; set; }

        // Información del archivo
        public string NombreArchivoOriginal { get; set; }
        public string NombreArchivoAlmacenado { get; set; } // Nombre en storage (UUID)
        public string RutaCompleta { get; set; } // URI/path completo en storage
        public string TipoMime { get; set; } // application/pdf, image/jpeg, etc.
        public long TamañoBytes { get; set; }

        // Integridad
        public string HashSHA256 { get; set; } // Para validar integridad del archivo
        public bool IntegridadVerificada { get; set; } = false;

        // Ciclo de vida
        public DateTime FechaCarga { get; set; } = DateTime.UtcNow;
        public string CargadoPor { get; set; } // UserId
        public DateTime? FechaDescarga { get; set; }
        public string DescargadoPor { get; set; }

        // Retención
        public DateTime? FechaEliminacion { get; set; } // Para cumplir políticas de retención
        public bool PendienteEliminacion { get; set; } = false;
        public string MotivoEliminacion { get; set; }

        // Relación
        public RecepcionDocumento RecepcionDocumento { get; set; }
    }
}
