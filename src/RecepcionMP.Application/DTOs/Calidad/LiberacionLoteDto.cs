namespace RecepcionMP.Application.DTOs;

public class LiberacionLoteDto
{
    public int Id { get; set; }
    public int LoteId { get; set; }
    public int RecepcionId { get; set; }
    public string Estado { get; set; } // Enum name
    public DateTime FechaDecision { get; set; }
    public string LiberadoPor { get; set; }
    public string Observaciones { get; set; }
    public string MotivoRechazo { get; set; }
}

public class LiberarLoteDto
{
    public string Observaciones { get; set; }
}

public class RechazarLoteDto
{
    public string Motivo { get; set; }
}

public class ValidacionLiberacionDto
{
    public bool CanLiberate { get; set; }
    public List<string> Motivos { get; set; } = new();
}
