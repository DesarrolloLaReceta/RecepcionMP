using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Application.Interfaces;

/// <summary>
/// Orquestación del flujo de calidad: liberación, rechazo, no conformidades
/// Integra con DocumentoService para validar completitud de documentos
/// </summary>
public interface ICalidadService
{
    /// <summary>
    /// Libera un lote tras validar: documentos completos, checklist aprobado, sin no-conformidades críticas
    /// </summary>
    Task<LiberacionLote> LiberarLoteAsync(int loteId, string usuarioId, string observaciones = "");

    /// <summary>
    /// Rechaza un lote con motivo auditable
    /// </summary>
    Task<LiberacionLote> RechazarLoteAsync(int loteId, string usuarioId, string motivo);

    /// <summary>
    /// Registra una no conformidad detectada en calidad
    /// Puede ser Merma, RechazoParcial o RechazoTotal
    /// </summary>
    Task<NoConformidad> CrearNoConformidadAsync(
        int recepcionId,
        int loteId,
        TipoNoConformidad tipo,
        string descripcion,
        decimal cantidadAfectada,
        string unidadMedida,
        string causa,
        string usuarioId);

    /// <summary>
    /// Crea una acción correctiva para una no conformidad
    /// </summary>
    Task<AccionCorrectiva> CrearAccionCorrectivaAsync(
        int noConformidadId,
        string descripcion,
        string responsable,
        DateTime fechaVencimiento,
        string usuarioId);

    /// <summary>
    /// Cierra una acción correctiva tras validar su cumplimiento
    /// </summary>
    Task<AccionCorrectiva> CerrarAccionCorrectivaAsync(
        int accionId,
        string observacionesCierre,
        string usuarioId);

    /// <summary>
    /// Obtiene el checklist vigente para una categoría
    /// </summary>
    Task<CheckListBPMCategoria> ObtenerChecklistVigentePorCategoriaAsync(int categoriaId);

    /// <summary>
    /// Valida si un lote puede ser liberado (documentos, checklist, no conformidades)
    /// </summary>
    Task<(bool CanLiberate, List<string> Motivos)> ValidarLotePuedeLiberarseAsync(int loteId);

    /// <summary>
    /// Obtiene todas las no conformidades de una recepción
    /// </summary>
    Task<IEnumerable<NoConformidad>> ObtenerNoConformidadesPorRecepcionAsync(int recepcionId);

    /// <summary>
    /// Obtiene todas las acciones correctivas abiertas
    /// </summary>
    Task<IEnumerable<AccionCorrectiva>> ObtenerAccionesCorrectivasAbiertasAsync();

    /// <summary>
    /// Obtiene todas las acciones correctivas vencidas (sin cerrar)
    /// </summary>
    Task<IEnumerable<AccionCorrectiva>> ObtenerAccionesCorrectivasVencidaspAsync();

    /// <summary>
    /// Obtiene el estado actual de liberación de un lote
    /// </summary>
    Task<LiberacionLote?> ObtenerLiberacionLoteAsync(int loteId);

    /// <summary>
    /// Rechaza automáticamente los lotes de una recepción si faltan documentos requeridos.
    /// Retorna la cantidad de lotes rechazados.
    /// </summary>
    Task<int> RechazarLotesPorDocumentosFaltantesAsync(int recepcionId, string usuarioId);

}
