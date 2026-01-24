using System;

namespace RecepcionMP.Application.DTOs.Documento
{
    public class DocumentoValidacionDto
    {
        public int Id { get; set; }
        public int RecepcionDocumentoId { get; set; }
        public string Estado { get; set; }
        public bool EsValido { get; set; }
        public string Observaciones { get; set; }
        public string MotivoRechazo { get; set; }
        public string ValidadoPor { get; set; }
        public DateTime FechaValidacion { get; set; }
        public DateTime? FechaVencimientoDocumento { get; set; }
    }
}
