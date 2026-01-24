using RecepcionMP.Application.Interfaces;
using RecepcionMP.Application.Interfaces.Repositories;
using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Application.Services;

/// <summary>
/// Orquestación del flujo de control de calidad
/// Valida completitud de documentos, checklist BPM, y maneja no conformidades
/// </summary>
public class CalidadService : ICalidadService
{
    private readonly ILiberacionLoteRepository _liberacionRepository;
    private readonly INoConformidadRepository _noConformidadRepository;
    private readonly IAccionCorrectivaRepository _accionRepository;
    private readonly ICheckListBPMCategoriaRepository _checklistRepository;
    private readonly IDocumentoService _documentoService;
    private readonly IRecepcionRepository _recepcionRepository;
    private readonly ILoteRepository _loteRepository;
    private readonly RecepcionMP.Domain.Interfaces.IDomainEventPublisher _eventPublisher;

    public CalidadService(
        ILiberacionLoteRepository liberacionRepository,
        INoConformidadRepository noConformidadRepository,
        IAccionCorrectivaRepository accionRepository,
        ICheckListBPMCategoriaRepository checklistRepository,
        IDocumentoService documentoService,
        IRecepcionRepository recepcionRepository,
        ILoteRepository loteRepository,
        RecepcionMP.Domain.Interfaces.IDomainEventPublisher eventPublisher)
    {
        _liberacionRepository = liberacionRepository;
        _noConformidadRepository = noConformidadRepository;
        _accionRepository = accionRepository;
        _checklistRepository = checklistRepository;
        _documentoService = documentoService;
        _recepcionRepository = recepcionRepository;
        _loteRepository = loteRepository;
        _eventPublisher = eventPublisher;
    }
    public async Task<LiberacionLote> LiberarLoteAsync(int loteId, string usuarioId, string observaciones = "")
    {
        if (string.IsNullOrWhiteSpace(usuarioId))
            throw new ArgumentException("Usuario es requerido", nameof(usuarioId));

        // Validar que el lote exista
        var lote = await _loteRepository.GetByIdAsync(loteId);
        if (lote == null)
            throw new KeyNotFoundException($"Lote {loteId} no encontrado");

        if (lote.Item == null)
            throw new InvalidOperationException("Item del lote no encontrado");


        // Validar que puede liberarse
        var (canLiberate, motivos) = await ValidarLotePuedeLiberarseAsync(loteId);
        if (!canLiberate)
            throw new InvalidOperationException(
                $"El lote no puede liberarse. Motivos: {string.Join("; ", motivos)}");

        // Obtener o crear LiberacionLote
        var liberacion = await _liberacionRepository.GetPorLoteAsync(loteId);
        if (liberacion == null)
        {
            liberacion = new LiberacionLote
            {
                LoteId = loteId,
                RecepcionId = lote.RecepcionId
            };
            await _liberacionRepository.AddAsync(liberacion);
            liberacion = await _liberacionRepository.GetPorLoteAsync(loteId);
        }

        if (liberacion == null)
            throw new InvalidOperationException("No se pudo crear LiberacionLote");

        // Liberar
        liberacion.Liberar(usuarioId, observaciones);

        // Agregar evento de dominio para publicación
        liberacion.AgregarEvento(new RecepcionMP.Domain.Events.LoteLiberadoEvent(
            liberacion.LoteId,
            liberacion.RecepcionId,
            usuarioId,
            observaciones));

        await _liberacionRepository.UpdateAsync(liberacion);

        // Publicar eventos de dominio
        foreach (var evt in liberacion.DomainEvents)
            await _eventPublisher.PublishAsync(evt);

        liberacion.LimpiarEventos();

        return liberacion;
    }

    public async Task<LiberacionLote> RechazarLoteAsync(int loteId, string usuarioId, string motivo)
    {
        if (string.IsNullOrWhiteSpace(usuarioId))
            throw new ArgumentException("Usuario es requerido", nameof(usuarioId));

        if (string.IsNullOrWhiteSpace(motivo))
            throw new ArgumentException("Motivo es requerido", nameof(motivo));

        var lote = await _loteRepository.GetByIdAsync(loteId);
        if (lote == null)
            throw new KeyNotFoundException($"Lote {loteId} no encontrado");

        if (lote.Item == null)
            throw new InvalidOperationException("Item del lote no encontrado");

        // Obtener o crear LiberacionLote
        var liberacion = await _liberacionRepository.GetPorLoteAsync(loteId);
        if (liberacion == null)
        {
            liberacion = new LiberacionLote
            {
                LoteId = loteId,
                RecepcionId = lote.RecepcionId
            };
            await _liberacionRepository.AddAsync(liberacion);
            liberacion = await _liberacionRepository.GetPorLoteAsync(loteId);
        }

        if (liberacion == null)
            throw new InvalidOperationException("No se pudo crear LiberacionLote");

        // Rechazar
        liberacion.Rechazar(usuarioId, motivo);

        // Agregar evento de dominio
        liberacion.AgregarEvento(new RecepcionMP.Domain.Events.LoteRechazadoEvent(
            liberacion.LoteId,
            liberacion.RecepcionId,
            motivo,
            usuarioId));

        await _liberacionRepository.UpdateAsync(liberacion);

        // Publicar eventos
        foreach (var evt in liberacion.DomainEvents)
            await _eventPublisher.PublishAsync(evt);

        liberacion.LimpiarEventos();

        return liberacion;
    }

    public async Task<NoConformidad> CrearNoConformidadAsync(
        int recepcionId,
        int loteId,
        TipoNoConformidad tipo,
        string descripcion,
        decimal cantidadAfectada,
        string unidadMedida,
        string causa,
        string usuarioId)
    {
        if (string.IsNullOrWhiteSpace(descripcion))
            throw new ArgumentException("Descripción es requerida", nameof(descripcion));

        if (cantidadAfectada <= 0)
            throw new ArgumentException("Cantidad afectada debe ser mayor a 0", nameof(cantidadAfectada));

        if (string.IsNullOrWhiteSpace(usuarioId))
            throw new ArgumentException("Usuario es requerido", nameof(usuarioId));

        // Verificar que recepción existe
        var recepcion = await _recepcionRepository.ObtenerPorIdAsync(recepcionId);
        if (recepcion == null)
            throw new KeyNotFoundException($"Recepción {recepcionId} no encontrada");

        // Verificar que lote existe y pertenece a la recepción
        var lote = await _loteRepository.GetByIdAsync(loteId);
        if (lote == null)
            throw new KeyNotFoundException($"Lote {loteId} no encontrado");

        if (lote.RecepcionId != recepcionId)
            throw new InvalidOperationException($"Lote {loteId} no pertenece a Recepción {recepcionId}");

        var noConformidad = new NoConformidad
        {
            RecepcionId = recepcionId,
            LoteId = loteId,
            Tipo = tipo,
            Descripcion = descripcion,
            CantidadAfectada = cantidadAfectada,
            UnidadMedida = unidadMedida,
            Causa = causa,
            RegistradoPor = usuarioId
        };

        await _noConformidadRepository.AddAsync(noConformidad);
        return noConformidad;
    }

    public async Task<AccionCorrectiva> CrearAccionCorrectivaAsync(
        int noConformidadId,
        string descripcion,
        string responsable,
        DateTime fechaVencimiento,
        string usuarioId)
    {
        if (string.IsNullOrWhiteSpace(descripcion))
            throw new ArgumentException("Descripción es requerida", nameof(descripcion));

        if (string.IsNullOrWhiteSpace(responsable))
            throw new ArgumentException("Responsable es requerido", nameof(responsable));

        if (fechaVencimiento <= DateTime.UtcNow)
            throw new ArgumentException("Fecha de vencimiento debe ser futura", nameof(fechaVencimiento));

        if (string.IsNullOrWhiteSpace(usuarioId))
            throw new ArgumentException("Usuario es requerido", nameof(usuarioId));

        // Verificar que no conformidad existe
        var noConformidad = await _noConformidadRepository.GetByIdAsync(noConformidadId);
        if (noConformidad == null)
            throw new KeyNotFoundException($"No conformidad {noConformidadId} no encontrada");

        var accion = new AccionCorrectiva
        {
            NoConformidadId = noConformidadId,
            Descripcion = descripcion,
            Responsable = responsable,
            FechaVencimiento = fechaVencimiento,
            CreadaPor = usuarioId
        };

        await _accionRepository.AddAsync(accion);
        return accion;
    }

    public async Task<AccionCorrectiva> CerrarAccionCorrectivaAsync(
        int accionId,
        string observacionesCierre,
        string usuarioId)
    {
        if (string.IsNullOrWhiteSpace(usuarioId))
            throw new ArgumentException("Usuario es requerido", nameof(usuarioId));

        var accion = await _accionRepository.GetByIdAsync(accionId);
        if (accion == null)
            throw new KeyNotFoundException($"Acción correctiva {accionId} no encontrada");

        accion.Cerrar(observacionesCierre ?? string.Empty, usuarioId);
        await _accionRepository.UpdateAsync(accion);

        return accion;
    }

    public async Task<CheckListBPMCategoria> ObtenerChecklistVigentePorCategoriaAsync(int categoriaId)
    {
        var checklist = await _checklistRepository.GetVigentePorCategoriaAsync(categoriaId);
        if (checklist == null)
            throw new KeyNotFoundException($"No hay checklist vigente para categoría {categoriaId}");

        return checklist;
    }

    public async Task<(bool CanLiberate, List<string> Motivos)> ValidarLotePuedeLiberarseAsync(int loteId)
    {
        var motivos = new List<string>();

        var lote = await _loteRepository.GetByIdAsync(loteId);
        if (lote == null)
            throw new KeyNotFoundException($"Lote {loteId} no encontrado");

        // 1. Validar documentos completos
        var recepcion = await _recepcionRepository.ObtenerPorIdAsync(lote.RecepcionId);
        if (recepcion == null)
        {
            motivos.Add("Recepción no encontrada");
            return (false, motivos);
        }

        // Obtener documentos requeridos por categoría
        var documentosFaltantes = await _documentoService
            .ObtenerDocumentosRequeridosFaltantesAsync(recepcion.Id, lote.Item.CategoriaId);

        if (documentosFaltantes.Any())
            motivos.Add($"Faltan {documentosFaltantes.Count()} documentos requeridos");

        // 2. Validar que no hay no-conformidades abiertas sin acciones cerradas
        var noConformidades = await _noConformidadRepository.GetPorLoteAsync(loteId);
        var noConformidadesAbiertas = noConformidades
            .Where(n => n.Estado == EstadoNoConformidad.Abierta)
            .ToList();

        foreach (var nc in noConformidadesAbiertas)
        {
            if (!nc.TieneMotivoValidoParaCerrar())
                motivos.Add($"No conformidad '{nc.Descripcion}' tiene acciones abiertas");
        }

        // 3. Validar checklist vigente existe
        try
        {
            await ObtenerChecklistVigentePorCategoriaAsync(lote.Item.CategoriaId);
        }
        catch
        {
            motivos.Add($"No hay checklist vigente para categoría {lote.Item.CategoriaId}");
        }

        return (motivos.Count == 0, motivos);
    }

    public async Task<IEnumerable<NoConformidad>> ObtenerNoConformidadesPorRecepcionAsync(int recepcionId)
    {
        return await _noConformidadRepository.GetPorRecepcionAsync(recepcionId);
    }

    public async Task<IEnumerable<AccionCorrectiva>> ObtenerAccionesCorrectivasAbiertasAsync()
    {
        return await _accionRepository.GetAbiertasAsync();
    }

    public async Task<IEnumerable<AccionCorrectiva>> ObtenerAccionesCorrectivasVencidaspAsync()
    {
        return await _accionRepository.GetVencidasAsync();
    }

    public async Task<LiberacionLote?> ObtenerLiberacionLoteAsync(int loteId)
    {
        return await _liberacionRepository.GetPorLoteAsync(loteId);
    }

    public async Task<int> RechazarLotesPorDocumentosFaltantesAsync(int recepcionId, string usuarioId)
    {
        if (string.IsNullOrWhiteSpace(usuarioId))
            throw new ArgumentException("Usuario es requerido", nameof(usuarioId));

        var lotes = await _loteRepository.GetPorRecepcionAsync(recepcionId);
        var rechazados = 0;

        foreach (var lote in lotes)
        {
            var faltantes = await _documentoService.ObtenerDocumentosRequeridosFaltantesAsync(recepcionId, lote.Item.CategoriaId);
            if (faltantes != null && faltantes.Any())
            {
                var motivo = "Documentos requeridos faltantes: " + string.Join(", ", faltantes.Select(d => d.Nombre));
                await RechazarLoteAsync(lote.Id, usuarioId, motivo);
                rechazados++;
            }
        }

        return rechazados;
    }
}
