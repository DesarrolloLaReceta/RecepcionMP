namespace SistemaRecepcionMP.Domain.Entities;

public sealed class LavadoBotasManos : BaseEntity
{
    public DateTime Fecha { get; private set; }
    public string Turno { get; private set; } = string.Empty;
    public string Piso { get; private set; } = string.Empty;
    public string Entrada { get; private set; } = string.Empty;
    public int PersonasRevisadas { get; private set; }
    public string? Novedades { get; private set; }
    public string? Observaciones { get; private set; }
    public string? FotoEvidenciaPath { get; private set; }
    public Guid UsuarioId { get; private set; }

    public Usuario Usuario { get; private set; } = null!;

    private LavadoBotasManos() { }

    public LavadoBotasManos(
        DateTime fecha,
        string turno,
        string piso,
        string entrada,
        int personasRevisadas,
        string? novedades,
        string? observaciones,
        string? fotoEvidenciaPath,
        Guid usuarioId)
    {
        Fecha = fecha;
        Turno = turno;
        Piso = piso;
        Entrada = entrada;
        PersonasRevisadas = personasRevisadas;
        Novedades = novedades;
        Observaciones = observaciones;
        FotoEvidenciaPath = fotoEvidenciaPath;
        UsuarioId = usuarioId;
    }
}

