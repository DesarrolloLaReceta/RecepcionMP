using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Application.Common.Mappings;

// ─────────────────────────────────────────────────────────────────────────────
// USUARIO
// ─────────────────────────────────────────────────────────────────────────────

public sealed class UsuarioDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public PerfilUsuario Perfil { get; set; }
    public bool Activo { get; set; }
}

// ─────────────────────────────────────────────────────────────────────────────
// PROVEEDOR
// ─────────────────────────────────────────────────────────────────────────────

public class ProveedorResumenDto
{
    public Guid Id { get; set; }
    public string RazonSocial { get; set; } = string.Empty;
    public string Nit { get; set; } = string.Empty;
    public string? Ciudad { get; set; }
    public EstadoProveedor Estado { get; set; }
    public List<string> Categorias { get; set; } = new();
    public int DocumentosVigentes { get; set; }
    public int DocumentosPorVencer { get; set; }
    public int DocumentosVencidos { get; set; }
    public int TotalRecepciones { get; set; }
    public double TasaAceptacion { get; set; }
}

public sealed class ProveedorDetalleDto : ProveedorResumenDto
{
    public string? Telefono { get; set; }
    public string? EmailContacto { get; set; }
    public string? Direccion { get; set; }
    public DateTime CreadoEn { get; set; }
    public List<ContactoProveedorDto> Contactos { get; set; } = new();
    public List<DocumentoSanitarioDto> DocumentosSanitarios { get; set; } = new();
}

public sealed class ContactoProveedorDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Cargo { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public bool EsPrincipal { get; set; }
}

public sealed class DocumentoSanitarioDto
{
    public Guid Id { get; set; }
    public TipoDocumento TipoDocumento { get; set; }
    public string NumeroDocumento { get; set; } = string.Empty;
    public DateOnly FechaExpedicion { get; set; }
    public DateOnly FechaVencimiento { get; set; }
    public string? AdjuntoUrl { get; set; }
    public bool EstaVigente { get; set; }
    public int DiasParaVencer { get; set; }
    public EstadoVigencia EstadoVigencia { get; set; }
}

// ─────────────────────────────────────────────────────────────────────────────
// ÍTEM
// ─────────────────────────────────────────────────────────────────────────────

public sealed class CategoriaItemDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public bool RequiereCadenaFrio { get; set; }
    public bool RequierePresenciaCalidad { get; set; }
    public int VidaUtilMinimaDias { get; set; }
}

public class ItemResumenDto
{
    public Guid Id { get; set; }
    public Guid CategoriaId { get; set; }
    public string CodigoInterno { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string CategoriaNombre { get; set; } = string.Empty;
    public string UnidadMedida { get; set; } = string.Empty;
    public decimal? TemperaturaMinima { get; set; }
    public decimal? TemperaturaMaxima { get; set; }
    public bool RequiereCadenaFrio { get; set; }
    public bool Estado { get; set; }
}

public sealed class ItemDetalleDto : ItemResumenDto
{
    public string? Descripcion { get; set; }
    public int VidaUtilDias { get; set; }
    public bool RequiereLoteProveedor { get; set; }
    public CategoriaItemDto Categoria { get; set; } = null!;
    public List<TipoDocumentoExigidoDto> DocumentosRequeridos { get; set; } = new();
}

public sealed class TipoDocumentoExigidoDto
{
    public TipoDocumento TipoDocumento { get; set; }
    public bool EsObligatorio { get; set; }
    public string? Descripcion { get; set; }
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDEN DE COMPRA
// ─────────────────────────────────────────────────────────────────────────────

public class OrdenCompraResumenDto
{
    public Guid Id { get; set; }
    public string NumeroOC { get; set; } = string.Empty;
    public Guid ProveedorId { get; set; }
    public string ProveedorNombre { get; set; } = string.Empty;
    public string ProveedorNit { get; set; } = string.Empty;
    public DateOnly FechaEmision { get; set; }
    public DateOnly? FechaEntregaEsperada { get; set; }
    public EstadoOrdenCompra Estado { get; set; }
    public int TotalItems { get; set; }
    public decimal ValorTotal { get; set; }
    public bool RequiereCadenaFrio { get; set; }
    public List<DetalleOrdenCompraDto> Detalles { get; set; } = new();
}

public sealed class OrdenCompraDetalleDto : OrdenCompraResumenDto
{
    public string? Observaciones { get; set; }
    public string? CreadoPorNombre { get; set; } = string.Empty;
    public DateTime CreadoEn { get; set; }
    public List<RecepcionResumenDto> Recepciones { get; set; } = new();
}

public sealed class DetalleOrdenCompraDto
{
    public Guid Id { get; set; }
    public Guid ItemId { get; set; }
    public string ItemCodigo { get; set; } = string.Empty;
    public string ItemNombre { get; set; } = string.Empty;
    public string CategoriaNombre { get; set; } = string.Empty;
    public decimal CantidadSolicitada { get; set; }
    public decimal CantidadRecibida { get; set; }
    public decimal CantidadRechazada { get; set; }
    public decimal CantidadPendiente { get; set; }
    public string UnidadMedida { get; set; } = string.Empty;
    public decimal PrecioUnitario { get; set; }
    public decimal Subtotal { get; set; }
    public bool RequiereCadenaFrio { get; set; }
    public decimal? TemperaturaMinima { get; set; }
    public decimal? TemperaturaMaxima { get; set; }
}

// ─────────────────────────────────────────────────────────────────────────────
// RECEPCIÓN
// ─────────────────────────────────────────────────────────────────────────────

public class RecepcionResumenDto
{
    public Guid Id { get; set; }
    public string NumeroRecepcion { get; set; } = string.Empty;
    public string ProveedorNombre { get; set; } = string.Empty;
    public DateOnly FechaRecepcion { get; set; }
    public EstadoRecepcion Estado { get; set; }
    public int TotalLotes { get; set; }
}

public sealed class RecepcionDetalleDto : RecepcionResumenDto
{
    public string NumeroOC { get; set; } = string.Empty;
    public string? PlacaVehiculo { get; set; }
    public string? NombreTransportista { get; set; }
    public string? ObservacionesGenerales { get; set; }
    public FacturaDto? Factura { get; set; }
    public InspeccionVehiculoDto? InspeccionVehiculo { get; set; }
    public List<LoteResumenDto> Lotes { get; set; } = new();
    public List<DocumentoRecepcionDto> Documentos { get; set; } = new();
    public List<TemperaturaRegistroDto> RegistrosTemperatura { get; set; } = new();
}

public sealed class FacturaDto
{
    public Guid Id { get; set; }
    public string NumeroFactura { get; set; } = string.Empty;
    public DateOnly FechaFactura { get; set; }
    public decimal ValorTotal { get; set; }
    public string? AdjuntoUrl { get; set; }
    public string? NotaCreditoNumero { get; set; }
    public decimal? NotaCreditoValor { get; set; }
}

public sealed class InspeccionVehiculoDto
{
    public Guid Id { get; set; }
    public decimal? TemperaturaInicial { get; set; }
    public bool TemperaturaDentroRango { get; set; }
    public bool IntegridadEmpaque { get; set; }
    public bool LimpiezaVehiculo { get; set; }
    public bool PresenciaOloresExtranos { get; set; }
    public bool PlagasVisible { get; set; }
    public bool DocumentosTransporteOk { get; set; }
    public ResultadoInspeccion Resultado { get; set; }
    public string? Observaciones { get; set; }
    public string RegistradoPorNombre { get; set; } = string.Empty;
    public DateTime FechaRegistro { get; set; }
}

public sealed class DocumentoRecepcionDto
{
    public Guid Id { get; set; }
    public TipoDocumento TipoDocumento { get; set; }
    public string NombreArchivo { get; set; } = string.Empty;
    public string AdjuntoUrl { get; set; } = string.Empty;
    public DateTime FechaCarga { get; set; }
    public string CargadoPorNombre { get; set; } = string.Empty;
    public bool? EsValido { get; set; }
    public string? ObservacionValidacion { get; set; }
}

public sealed class TemperaturaRegistroDto
{
    public Guid Id { get; set; }
    public decimal Temperatura { get; set; }
    public string UnidadMedida { get; set; } = string.Empty;
    public DateTime FechaHora { get; set; }
    public OrigenTemperatura Origen { get; set; }
    public string? DispositivoId { get; set; }
    public bool EstaFueraDeRango { get; set; }
    public string? Observacion { get; set; }
    public string RegistradoPorNombre { get; set; } = string.Empty;
}

// ─────────────────────────────────────────────────────────────────────────────
// LOTE
// ─────────────────────────────────────────────────────────────────────────────

public class LoteResumenDto
{
    public Guid Id { get; set; }
    public string CodigoLoteInterno { get; set; } = string.Empty;
    public string? NumeroLoteProveedor { get; set; }
    public string ItemCodigo { get; set; } = string.Empty;
    public string ItemNombre { get; set; } = string.Empty;
    public DateOnly FechaVencimiento { get; set; }
    public int DiasVidaUtilRestantes { get; set; }
    public bool EstaVencido { get; set; }
    public decimal CantidadRecibida { get; set; }
    public decimal CantidadRechazada { get; set; }
    public EstadoLote Estado { get; set; }
    public UbicacionDestino? UbicacionDestino { get; set; }
}

public sealed class LoteDetalleDto : LoteResumenDto
{
    public DateOnly? FechaFabricacion { get; set; }
    public decimal? TemperaturaMedida { get; set; }
    public EstadoSensorial EstadoSensorial { get; set; }
    public EstadoRotulado EstadoRotulado { get; set; }
    public string? CodigoQr { get; set; }
    public string UnidadMedida { get; set; } = string.Empty;
    public LiberacionLoteDto? Liberacion { get; set; }
    public CuarentenaDto? Cuarentena { get; set; }
    public List<DocumentoRecepcionDto> Documentos { get; set; } = new();
    public List<ResultadoChecklistDto> ResultadosChecklist { get; set; } = new();
    public List<NoConformidadResumenDto> NoConformidades { get; set; } = new();
    public List<TemperaturaRegistroDto> RegistrosTemperatura { get; set; } = new();
}

public sealed class LiberacionLoteDto
{
    public DecisionLiberacion Decision { get; set; }
    public string? Observaciones { get; set; }
    public string LiberadoPorNombre { get; set; } = string.Empty;
    public DateTime FechaLiberacion { get; set; }
}

public sealed class CuarentenaDto
{
    public Guid Id { get; set; }
    public DateOnly FechaCuarentena { get; set; }
    public DateOnly? FechaLiberacion { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public string? AccionesRealizadas { get; set; }
    public DecisionCuarentena? Decision { get; set; }
    public string SeguidoPorNombre { get; set; } = string.Empty;
    public bool EstaActiva { get; set; }
}

// ─────────────────────────────────────────────────────────────────────────────
// CALIDAD — CHECKLISTS
// ─────────────────────────────────────────────────────────────────────────────

public sealed class ChecklistBPMDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public Guid CategoriaId { get; set; }
    public string CategoriaNombre { get; set; } = string.Empty;
    public int Version { get; set; }
    public bool Estado { get; set; }
    public DateTime CreadoEn { get; set; }
    public int TotalCriterios { get; set; }
    public int Obligatorios { get; set; }
    public List<ItemChecklistDto> Items { get; set; } = new();
}

public sealed class ItemChecklistDto
{
    public Guid Id { get; set; }
    public string Criterio { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public bool EsCritico { get; set; }
    public int Orden { get; set; }
    public TipoCriterio TipoCriterio { get; set; }
    public decimal? ValorMinimo { get; set; }
    public decimal? ValorMaximo { get; set; }
    public string? Unidad { get; set; }
}

public sealed class ResultadoChecklistDto
{
    public Guid Id { get; set; }
    public string Criterio { get; set; } = string.Empty;
    public bool EsCritico { get; set; }
    public ResultadoItem Resultado { get; set; }
    public string? Observacion { get; set; }
    public string RegistradoPorNombre { get; set; } = string.Empty;
    public DateTime FechaRegistro { get; set; }
}

// ─────────────────────────────────────────────────────────────────────────────
// NO CONFORMIDADES
// ─────────────────────────────────────────────────────────────────────────────

public sealed class CausalNoConformidadDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public TipoAccionCorrectiva TipoAccionSugerida { get; set; }
}

public class NoConformidadResumenDto
{
    public Guid Id { get; set; }
    public string Numero { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public TipoNoConformidad Tipo { get; set; }
    public PrioridadNoConformidad Prioridad { get; set; }
    public EstadoNoConformidad Estado { get; set; }
    public string CausalNombre { get; set; } = string.Empty;
    public decimal CantidadAfectada { get; set; }
    public string? AsignadoA { get; set; }
    public DateOnly? FechaLimite { get; set; }
    public DateTime CreadoEn { get; set; }
    public string CreadoPorNombre { get; set; } = string.Empty;
    // Datos del lote
    public string NumeroLote { get; set; } = string.Empty;
    public string ItemNombre { get; set; } = string.Empty;
    public string ProveedorNombre { get; set; } = string.Empty;
    public int TotalAcciones { get; set; }
    public int AccionesPendientes { get; set; }
}

public sealed class NoConformidadDetalleDto : NoConformidadResumenDto
{
    public string Descripcion { get; set; } = string.Empty;
    public string? CausaRaiz { get; set; }
    public string? ObservacionesCierre { get; set; }
    public DateTime? FechaCierre { get; set; }
    public List<AccionCorrectivaDto> AccionesCorrectivas { get; set; } = new();
    public List<ComentarioNCDto> Comentarios { get; set; } = new();
}

public sealed class ComentarioNCDto
{
    public Guid Id { get; set; }
    public string Texto { get; set; } = string.Empty;
    public string AutorNombre { get; set; } = string.Empty;
    public DateTime FechaRegistro { get; set; }
}

public sealed class AccionCorrectivaDto
{
    public Guid Id { get; set; }
    public string DescripcionAccion { get; set; } = string.Empty;
    public string ResponsableNombre { get; set; } = string.Empty;
    public DateOnly FechaCompromiso { get; set; }
    public DateOnly? FechaCierre { get; set; }
    public EstadoAccionCorrectiva Estado { get; set; }
    public string? EvidenciaUrl { get; set; }
    public bool EstaVencida { get; set; }
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

public sealed class VencimientoProximoDto
{
    public string CodigoLote { get; set; } = string.Empty;
    public string ItemNombre { get; set; } = string.Empty;
    public string ProveedorNombre { get; set; } = string.Empty;
    public DateOnly FechaVencimiento { get; set; }
    public int DiasRestantes { get; set; }
    public EstadoLote EstadoLote { get; set; }
}

public sealed class DocumentoPorVencerDto
{
    public Guid Id { get; set; }
    public string ProveedorNombre { get; set; } = string.Empty;
    public TipoDocumento TipoDocumento { get; set; }
    public string NumeroDocumento { get; set; } = string.Empty;
    public DateOnly FechaVencimiento { get; set; }
    public int DiasParaVencer { get; set; }
    public EstadoVigencia EstadoVigencia { get; set; }
}

public sealed class TemperaturaFueraRangoDto
{
    public Guid Id { get; set; }
    public string? NumeroRecepcion { get; set; }
    public string? CodigoLote { get; set; }
    public decimal Temperatura { get; set; }
    public DateTime FechaHora { get; set; }
    public OrigenTemperatura Origen { get; set; }
}