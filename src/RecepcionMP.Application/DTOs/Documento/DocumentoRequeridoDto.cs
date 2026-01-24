namespace RecepcionMP.Application.DTOs.Documento
{
    public class DocumentoRequeridoDto
    {
        public int Id { get; set; }
        public int CategoriaId { get; set; }
        public string Nombre { get; set; }
        public string TipoDocumento { get; set; }
        public bool EsObligatorio { get; set; }
        public int? VigenciaDias { get; set; }
    }
}