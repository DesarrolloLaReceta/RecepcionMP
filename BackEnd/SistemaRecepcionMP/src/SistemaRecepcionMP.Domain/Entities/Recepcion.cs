using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Domain.Entities;

public class Recepcion : BaseEntity
{
    public string NumeroRecepcion { get; set; } = string.Empty;
    public Guid OrdenCompraId { get; set; }
    public Guid ProveedorId { get; set; }
    public DateOnly FechaRecepcion { get; set; }
    public TimeOnly HoraLlegadaVehiculo { get; set; }
    public string? PlacaVehiculo { get; set; }
    public string? NombreTransportista { get; set; }
    public EstadoRecepcion Estado { get; set; } = EstadoRecepcion.Iniciada;
    public ResultadoRecepcion? Resultado { get; private set; }
    public string? ObservacionesGenerales { get; set; }
    public Guid CreadoPor { get; set; }
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;
    public DateTime? ActualizadoEn { get; set; }

    // Navegación
    public OrdenCompra OrdenCompra { get; set; } = null!;
    public Proveedor Proveedor { get; set; } = null!;
    public Usuario UsuarioCreador { get; set; } = null!;
    public ICollection<RecepcionItem>? Items { get; private set; }
    public ICollection<Factura> Facturas { get; set; } = new List<Factura>();
    public InspeccionVehiculo? InspeccionVehiculo { get; set; }
    public ICollection<DocumentoRecepcion> Documentos { get; set; } = new List<DocumentoRecepcion>();
    public ResultadoRecepcion Resultado { get; private set; }
    public ICollection<TemperaturaRegistro> RegistrosTemperatura { get; set; } = new List<TemperaturaRegistro>();
}

public void ValidarPuedeRegistrarLotes()
{
    if (Estado != EstadoRecepcion.InspeccionVehiculo &&
        Estado != EstadoRecepcion.RegistroLotes)
    {
        throw new RecepcionEstadoInvalidoException(
            NumeroRecepcion, Estado, "registrar lote");
    }
}

public void Finalizar()
{
    ValidarPuedeFinalizar();

    var totalEsperado = Items.Sum(i => i.CantidadEsperada);
    var totalRecibido = Items.Sum(i => i.CantidadRecibida);
    var totalRechazado = Items.Sum(i => i.CantidadRechazada);

    Resultado = CalcularResultado(totalEsperado, totalRecibido, totalRechazado);

    Estado = EstadoRecepcion.Finalizada;
}

private void ValidarPuedeFinalizar()
{
    if (Estado != EstadoRecepcion.RegistroLotes)
        throw new RecepcionEstadoInvalidoException(
            NumeroRecepcion, Estado, "finalizar");

    if (!Items.Any())
        throw new BusinessRuleException("No hay ítems en la recepción.");

    if (Items.All(i => !i.Lotes.Any()))
        throw new BusinessRuleException("No se han registrado lotes.");
}

private ResultadoRecepcion CalcularResultado(
    decimal esperado,
    decimal recibido,
    decimal rechazado)
{
    if (recibido == 0)
        return ResultadoRecepcion.RechazoTotal;

    if (rechazado == 0 && recibido == esperado)
        return ResultadoRecepcion.Conforme;

    if (rechazado > 0 && recibido > 0)
        return ResultadoRecepcion.ConObservaciones;

    if (recibido < esperado)
        return ResultadoRecepcion.Incompleto;

    return ResultadoRecepcion.ConObservaciones;
}