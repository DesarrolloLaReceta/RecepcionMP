namespace RecepcionMP.Domain.Entities
{
    /// <summary>
    /// Define documentos obligatorios por categoría según normativa
    /// Resol. 2674/2013, Decreto 1500 (cárnicos), Decreto 616 (lácteos)
    /// </summary>
    public class DocumentoRequerido
    {
        public int Id { get; set; }
        public int CategoriaId { get; set; }
        public TipoDocumento TipoDocumento { get; set; }
        public string Nombre { get; set; } // Ej: "Certificado INVIMA", "COA Microbiología"
        public string Descripcion { get; set; }
        public bool EsObligatorio { get; set; } = true;
        public int? VigenciaDias { get; set; } // Null = sin vencimiento, ej: 365 = 1 año
        public bool Activo { get; set; } = true;
        public int Versión { get; set; } = 1;
        public DateTime FechaVigencia { get; set; } = DateTime.UtcNow;

        // Relación
        public Categoria Categoria { get; set; }
        public ICollection<RecepcionDocumento> RecepcionesDocumentos { get; set; } = new List<RecepcionDocumento>();
    }

    public enum TipoDocumento
    {
        RegistroINVIMA = 1,
        NotificacionSanitaria = 2,
        PermisoINVIMA = 3,
        CertificadoAnalisis = 4, // COA
        CertificadoTemperatura = 5,
        CertificadoTransporte = 6,
        VerificacionRotulado = 7,
        HabilitacionEspecifica = 8, // Decreto 1500, 616, etc.
        PlanillaRecepcion = 9,
        FotosEstado = 10,
        Otro = 99
    }
}