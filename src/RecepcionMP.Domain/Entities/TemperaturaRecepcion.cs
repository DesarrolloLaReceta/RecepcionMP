namespace RecepcionMP.Domain.Entities;

public class TemperaturaRecepcion
{
    public int Id { get; set; }

    public int RecepcionId { get; set; }
    public Recepcion Recepcion { get; set; } = null!;

    public decimal Temperatura { get; set; }
    public string PuntoControl { get; set; } = string.Empty;
}
