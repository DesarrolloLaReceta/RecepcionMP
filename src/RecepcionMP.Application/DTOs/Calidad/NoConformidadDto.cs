using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Application.DTOs;

public class NoConformidadDto
{
    public int Id { get; set; }
    public int RecepcionId { get; set; }
    public int LoteId { get; set; }
    public string Tipo { get; set; } // Enum name
    public string Descripcion { get; set; }
    public decimal CantidadAfectada { get; set; }
    public string UnidadMedida { get; set; }
    public string Causa { get; set; }
    public DateTime FechaRegistro { get; set; }
    public string Estado { get; set; } // Enum name
    public string RegistradoPor { get; set; }
    public int AccionesCorrectivasCount { get; set; }
    public int AccionesCorrectivasCerradasCount { get; set; }
}

public class CrearNoConformidadDto
{
    public int LoteId { get; set; }
    public string Tipo { get; set; } // "Merma", "RechazoParcial", "RechazoTotal"
    public string Descripcion { get; set; }
    public decimal CantidadAfectada { get; set; }
    public string UnidadMedida { get; set; }
    public string Causa { get; set; }
}
