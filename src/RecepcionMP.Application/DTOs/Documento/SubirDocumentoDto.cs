using System;

namespace RecepcionMP.Application.DTOs.Documento
{
    public class SubirDocumentoDto
    {
        public int DocumentoRequeridoId { get; set; }
        public string NombreArchivo { get; set; }
        public string TipoMime { get; set; }
    }
}
