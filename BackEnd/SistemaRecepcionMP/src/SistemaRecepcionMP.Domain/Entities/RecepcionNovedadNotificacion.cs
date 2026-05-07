namespace SistemaRecepcionMP.Domain.Entities;

public class RecepcionNovedadNotificacion : BaseEntity
{
    public Guid RecepcionNovedadId { get; private set; }
    public RecepcionNovedad RecepcionNovedad { get; private set; } = null!;

    public string Canal { get; private set; } = "Email";
    public string Destinatario { get; private set; } = string.Empty;
    public string Asunto { get; private set; } = string.Empty;
    public string Resultado { get; private set; } = string.Empty;
    public DateTime FechaEnvioUtc { get; private set; } = DateTime.UtcNow;
    public string? ErrorTecnico { get; private set; }

    public RecepcionNovedadNotificacion() { }

    public RecepcionNovedadNotificacion(
        Guid recepcionNovedadId,
        string destinatario,
        string asunto,
        string resultado,
        string? errorTecnico = null)
    {
        RecepcionNovedadId = recepcionNovedadId;
        Destinatario = destinatario;
        Asunto = asunto;
        Resultado = resultado;
        ErrorTecnico = errorTecnico;
    }
}
