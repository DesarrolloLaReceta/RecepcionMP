using System;

namespace RecepcionMP.Application.DTOs.Documento
{
    public class DocumentoAdjuntoDto
    {
        public int Id { get; set; }
        public string NombreArchivoOriginal { get; set; }
        public string TipoMime { get; set; }
        public long TamañoBytes { get; set; }
        public DateTime FechaCarga { get; set; }
        public bool IntegridadVerificada { get; set; }
        public bool PendienteEliminacion { get; set; }
    }
}
