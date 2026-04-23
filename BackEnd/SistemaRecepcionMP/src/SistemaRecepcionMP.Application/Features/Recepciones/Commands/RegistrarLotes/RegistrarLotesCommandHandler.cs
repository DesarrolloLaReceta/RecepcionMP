using MediatR;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;
using SistemaRecepcionMP.Domain.Services;
using SistemaRecepcionMP.Domain.Exceptions;
using SistemaRecepcionMP.Domain.Interfaces;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.RegistrarLotes;

// Definición del Command (Contrato de entrada)
public record RegistrarLotesCommand(
    Guid RecepcionId,
    List<ItemConLotesDto> Items
) : IRequest<bool>;

public record ItemConLotesDto(
    Guid RecepcionItemId,
    List<DetalleLoteDto> Lotes
);

public record DetalleLoteDto(
    string? NumeroLoteProveedor,
    decimal CantidadRecibida,
    DateOnly FechaVencimiento,
    decimal? TemperaturaMedida,
    int EstadoSensorial, 
    int EstadoRotulado
);

// El Handler que procesa la lógica
public class RegistrarLotesCommandHandler : IRequestHandler<RegistrarLotesCommand, bool>
{
    private readonly IRecepcionRepository _recepcionRepository;
    private readonly RecepcionDomainService _recepcionService;
    private readonly IUnitOfWork _unitOfWork;

    public RegistrarLotesCommandHandler(
        IRecepcionRepository recepcionRepository,
        RecepcionDomainService recepcionService,
        IUnitOfWork unitOfWork)
    {
        _recepcionRepository = recepcionRepository;
        _recepcionService = recepcionService;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(RegistrarLotesCommand request, CancellationToken ct)
    {
        // 1. Obtener la recepción. IMPORTANTE: El repositorio debe incluir los Items y el Maestro de Items
        var recepcion = await _recepcionRepository.GetWithLotesAsync(request.RecepcionId);
        
        if (recepcion == null)
            throw new NotFoundException("Recepcion", request.RecepcionId);

        foreach (var itemRequest in request.Items)
        {
            var recepcionItem = recepcion.Items.FirstOrDefault(i => i.Id == itemRequest.RecepcionItemId);
            if (recepcionItem == null) continue;

            // Obtenemos el maestro para validar Vida Útil y Temperatura
            var maestroItem = recepcionItem.Item;

            foreach (var loteDto in itemRequest.Lotes)
            {
                // 2. Instanciamos el LoteRecibido
                var nuevoLote = new LoteRecibido(
                    recepcionItem.Id,
                    loteDto.NumeroLoteProveedor,
                    null, // Fecha Fabricación opcional
                    loteDto.FechaVencimiento,
                    loteDto.CantidadRecibida,
                    0,    // Cantidad rechazada inicial
                    recepcionItem.UnidadMedida,
                    loteDto.TemperaturaMedida,
                    (EstadoSensorial)loteDto.EstadoSensorial,
                    (EstadoRotulado)loteDto.EstadoRotulado,
                    null  // Ubicación inicial
                );

                // 3. Validar y Agregar mediante el Domain Service (la carpeta Services que creaste)
                _recepcionService.ValidarYAgregarLote(recepcionItem, nuevoLote, maestroItem);
            }
        }

        // 4. Guardar cambios a través del Unit of Work
        return await _unitOfWork.SaveChangesAsync(ct) > 0;
    }
}