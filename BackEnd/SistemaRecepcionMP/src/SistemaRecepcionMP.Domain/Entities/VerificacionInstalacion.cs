namespace SistemaRecepcionMP.Domain.Entities;

public sealed class VerificacionInstalacion : BaseEntity
{
    public string Zona { get; private set; } = string.Empty;
    public DateTime Fecha { get; private set; }
    public Guid UsuarioId { get; private set; }
    public decimal CumplimientoTotal { get; private set; }
    public string NombreResponsable { get; private set; } = string.Empty;
    public string CargoResponsable { get; private set; } = string.Empty;

    public Usuario Usuario { get; private set; } = null!;

    private readonly List<VerificacionInstalacionDetalle> _detalles = new();
    public IReadOnlyCollection<VerificacionInstalacionDetalle> Detalles => _detalles;

    private VerificacionInstalacion() { }

    public VerificacionInstalacion(
        string zona,
        DateTime fecha,
        Guid usuarioId,
        decimal cumplimientoTotal,
        string nombreResponsable,
        string cargoResponsable)
    {
        Zona = zona;
        Fecha = fecha;
        UsuarioId = usuarioId;
        CumplimientoTotal = cumplimientoTotal;
        NombreResponsable = nombreResponsable;
        CargoResponsable = cargoResponsable;
    }

    public void AgregarDetalle(VerificacionInstalacionDetalle detalle)
    {
        _detalles.Add(detalle);
    }
}

