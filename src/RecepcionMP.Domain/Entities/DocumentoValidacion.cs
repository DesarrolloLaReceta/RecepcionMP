using System;

namespace RecepcionMP.Domain.Entities
{
    /// <summary>
    /// Registro de validación realizada a un documento adjunto
    /// Cumplimiento Res. 2674/2013 - Auditoría de conformidad documental
    /// </summary>
    public class DocumentoValidacion
    {
        public int Id { get; set; }
        public int RecepcionDocumentoId { get; set; }
        public int DocumentoRequeridoId { get; set; }

        // Resultado de validación
        public EstadoValidacionDocumento Estado { get; set; } = EstadoValidacionDocumento.Pendiente;
        public bool EsValido { get; set; } = false;

        // Detalles
        public string ResultadoValidacion { get; set; } // Resumen de qué se validó
        public string Observaciones { get; set; } // Notas adicionales
        public string MotivoRechazo { get; set; } // Si aplica (formato, vencimiento, contenido)

        // Auditoría
        public string ValidadoPor { get; set; } // UserId que validó
        public DateTime FechaValidacion { get; set; } = DateTime.UtcNow;

        // Vigencia
        public DateTime? FechaVencimientoDocumento { get; set; } // Extraída del documento si aplica
        public bool EstaVigente { get; set; } = true;

        // Relaciones
        public RecepcionDocumento RecepcionDocumento { get; set; }
        public DocumentoRequerido DocumentoRequerido { get; set; }
    }

    public enum EstadoValidacionDocumento
    {
        Pendiente = 1,
        ValidoOK = 2,
        RechazadoFormatoInvalido = 3,
        RechazadoContenidoIncompleto = 4,
        RechazadoVencido = 5,
        RechazadoOtro = 6
    }
}
