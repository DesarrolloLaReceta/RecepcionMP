namespace RecepcionMP.Application.DTOs;

public class AccionCorrectivaDto
{
    public int Id { get; set; }
    public int NoConformidadId { get; set; }
    public string Descripcion { get; set; }
    public string Responsable { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime FechaVencimiento { get; set; }
    public DateTime? FechaCompletacion { get; set; }
    public string Estado { get; set; } // Enum name
    public string Observaciones { get; set; }
    public string CreadaPor { get; set; }
    public string CerradaPor { get; set; }
    public bool EstaVencida { get; set; }
    public int DíasRestantes { get; set; }
}

public class CrearAccionCorrectivaDto
{
    public string Descripcion { get; set; }
    public string Responsable { get; set; }
    public DateTime FechaVencimiento { get; set; }
}

public class CerrarAccionCorrectivaDto
{
    public string ObservacionesCierre { get; set; }
}
