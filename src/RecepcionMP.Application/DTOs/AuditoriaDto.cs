using System;

namespace RecepcionMP.Application.DTOs
{
    public class AuditoriaDto
    {
        public string UsuarioId { get; set; }
        public string NombreUsuario { get; set; }
        public string IP { get; set; }
        public DateTime FechaHora { get; set; }
        public string Tabla { get; set; }
        public int RegistroId { get; set; }
        public int Accion { get; set; }
        public string ValoresAntes { get; set; }
        public string ValoresDespues { get; set; }
        public string Descripcion { get; set; }
    }
}