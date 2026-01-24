using RecepcionMP.Application.DTOs;
using RecepcionMP.Application.Interfaces;
using RecepcionMP.Application.Interfaces.Repositories;
using RecepcionMP.Domain.Entities;
using RecepcionMP.Domain.Events;
using RecepcionMP.Domain.Interfaces;

public class RecepcionService : IRecepcionService
{
    private readonly IRecepcionRepository _recepcionRepository;
    private readonly IOrdenCompraRepository _ordenCompraRepository;
    private readonly IDomainEventPublisher _eventPublisher;

    public RecepcionService(
        IRecepcionRepository recepcionRepository,
        IOrdenCompraRepository ordenCompraRepository,
        IDomainEventPublisher eventPublisher)
    {
        _recepcionRepository = recepcionRepository;
        _ordenCompraRepository = ordenCompraRepository;
        _eventPublisher = eventPublisher;
    }

    /// <summary>
    /// Crea una nueva recepción con reglas de negocio y eventos de dominio.
    /// </summary>
    public async Task<int> CrearAsync(CreateRecepcionDto dto)
    {
        // 1️ Validar OC
        var orden = await _ordenCompraRepository.GetByIdAsync(dto.OrdenCompraId)
            ?? throw new InvalidOperationException("La orden de compra no existe");

        if (orden.Estado != EstadoOrdenCompra.Abierta)
            throw new InvalidOperationException("La orden de compra no está abierta");

        // 2️ Validaciones básicas
        if (!dto.Lotes.Any())
            throw new InvalidOperationException("La recepción debe contener al menos un lote");

        await ValidarCantidadesAsync(orden, dto.Lotes);

        // 3️ Determinar si queda completa
        if (EstaCompleta(orden, dto.Lotes))
            orden.Estado = EstadoOrdenCompra.Recepcionada;

        // 4️ Crear recepción
        var recepcion = new Recepcion
        {
            FechaRecepcion = dto.FechaRecepcion,
            OrdenCompraId = dto.OrdenCompraId,
            ProveedorId = orden.ProveedorId,
            FacturaId = dto.FacturaId,
            PlacaVehiculo = dto.PlacaVehiculo,
            NombreTransportista = dto.NombreTransportista,
            RequiereAprobacionCalidad = true,
            Estado = EstadoRecepcion.Cuarentena
        };

        // 5️ Agregar lotes
        foreach (var loteDto in dto.Lotes)
        {
            recepcion.Lotes.Add(new Lote
            {
                ItemId = loteDto.ItemId,
                NumeroLote = loteDto.NumeroLote,
                FechaFabricacion = loteDto.FechaFabricacion,
                FechaVencimiento = loteDto.FechaVencimiento,
                CantidadRecibida = loteDto.CantidadRecibida,
                UnidadMedida = loteDto.UnidadMedida,
                LiberadoCalidad = false
            });
        }

        // 6️ Checklist BPM
        var checkList = new CheckListBPM(recepcion.Id);

        foreach (var item in dto.ChecklistItems)
        {
            checkList.Items.Add(new CheckListItem(
                item.Nombre,
                item.EsConforme,
                item.EsCritico,
                item.Observacion
            ));
        }

        if (!checkList.EsAprobado())
        {
            recepcion.Rechazar("La recepción no cumple requisitos BPM");
            throw new InvalidOperationException("Checklist BPM no aprobado");
        }

        recepcion.AsociarCheckList(checkList);

        // 7️ Definir estado
        recepcion.DefinirEstadoSegunAprobacionCalidad(dto.UsuarioId ?? "sistema");

        // 8️ Evento de dominio
        recepcion.AgregarEvento(new RecepcionCreadaEvent(
            recepcion.Id,
            recepcion.OrdenCompraId,
            recepcion.ProveedorId,
            recepcion.FechaRecepcion,
            recepcion.RequiereAprobacionCalidad,
            dto.UsuarioId ?? "sistema"
        ));

        // 9️ Persistir
        await _recepcionRepository.AddAsync(recepcion);

        // 10 Publicar eventos
        foreach (var evt in recepcion.DomainEvents)
            await _eventPublisher.PublishAsync(evt);

        recepcion.LimpiarEventos();

        return recepcion.Id;
    }

    /// <summary>
    /// Obtiene una recepción por ID
    /// </summary>
    public async Task<RecepcionDto?> ObtenerPorIdAsync(int id)
    {
        var recepcion = await _recepcionRepository.ObtenerPorIdAsync(id);
        if (recepcion == null) return null;

        return new RecepcionDto
        {
            Id = recepcion.Id,
            FechaRecepcion = recepcion.FechaRecepcion,
            OrdenCompraId = recepcion.OrdenCompraId,
            FacturaId = recepcion.FacturaId ?? 0,
            PlacaVehiculo = recepcion.PlacaVehiculo ?? string.Empty,
            Estado = recepcion.Estado,
            RequiereAprobacionCalidad = recepcion.RequiereAprobacionCalidad,
            Lotes = recepcion.Lotes.Select(l => new LoteDto
            {
                ItemId = l.ItemId,
                ItemNombre = l.Item?.Nombre ?? "Sin nombre",
                NumeroLote = l.NumeroLote,
                FechaFabricacion = l.FechaFabricacion,
                FechaVencimiento = l.FechaVencimiento,
                CantidadRecibida = l.CantidadRecibida,
                UnidadMedida = l.UnidadMedida,
                LiberadoCalidad = l.LiberadoCalidad
            }).ToList()
        };
    }

    // ========================
    // VALIDACIONES DE DOMINIO
    // ========================

    internal async Task ValidarCantidadesAsync(
        OrdenCompra orden,
        IEnumerable<CreateLoteDto> lotes)
    {
        var recibidos = lotes
            .GroupBy(l => l.ItemId)
            .ToDictionary(g => g.Key, g => g.Sum(x => x.CantidadRecibida));

        foreach (var item in orden.Items)
        {
            recibidos.TryGetValue(item.ItemId, out var cantidadActual);

            if (cantidadActual < 0)
                throw new InvalidOperationException($"Cantidad inválida para item {item.ItemId}");

            if (cantidadActual > item.CantidadEsperada)
                throw new InvalidOperationException(
                    $"Cantidad recibida supera la esperada para item {item.ItemId}");
        }
    }

    internal bool EstaCompleta(
        OrdenCompra orden,
        IEnumerable<CreateLoteDto> lotes)
    {
        var recibidos = lotes
            .GroupBy(l => l.ItemId)
            .ToDictionary(g => g.Key, g => g.Sum(x => x.CantidadRecibida));

        return orden.Items.All(item =>
            recibidos.TryGetValue(item.ItemId, out var cantidad) &&
            cantidad >= item.CantidadEsperada);
    }

    public async Task<IEnumerable<RecepcionDto>> ObtenerTodosAsync()
{
    var recepciones = await _recepcionRepository.ObtenerTodosAsync();

    return recepciones.Select(r => new RecepcionDto
    {
        Id = r.Id,
        FechaRecepcion = r.FechaRecepcion,

        OrdenCompraId = r.OrdenCompraId,
        FacturaId = r.FacturaId ?? 0,

        PlacaVehiculo = r.PlacaVehiculo,
        NombreTransportista = r.NombreTransportista,

        Estado = r.Estado,
        RequiereAprobacionCalidad = r.RequiereAprobacionCalidad,

        //  En listado NO cargamos lotes
        Lotes = new List<LoteDto>()
    });
}

}
