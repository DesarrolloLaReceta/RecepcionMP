namespace RecepcionMP.Application.DTOs.Documento
{
    public class RecepcionDocumentoDto
    {
        public int Id { get; set; }
        public int RecepcionId { get; set; }
        public string NombreArchivo { get; set; }
        public string Estado { get; set; }
        public string TipoDocumento { get; set; }
    }
}