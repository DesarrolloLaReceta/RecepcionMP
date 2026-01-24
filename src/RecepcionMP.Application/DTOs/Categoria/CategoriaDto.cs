using System.Collections.Generic;
using RecepcionMP.Application.DTOs.Documento;

namespace RecepcionMP.Application.DTOs.Categoria
{
    public class CategoriaDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public string TipoAlimento { get; set; }
        public List<DocumentoRequeridoDto> DocumentosRequeridos { get; set; } = new();
    }
}