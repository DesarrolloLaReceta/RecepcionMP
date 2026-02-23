using SistemaRecepcionMP.Application.Common.Behaviours;
using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Exceptions.Temperatura;
using SistemaRecepcionMP.Domain.Interfaces;
using SistemaRecepcionMP.Domain.ValueObjects;
using FluentValidation;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands;

public sealed class RegistrarTemperaturaCommand : IRequest<Guid>, IAuditableCommand
{
    public Guid? RecepcionId { get; set; }
    public Guid? LoteRecibidoId { get; set; }
    public decimal Temperatura { get; set; }
    public string UnidadMedida { get; set; } = "°C";
    public OrigenTemperatura Origen { get; set; }
    public string? DispositivoId { get; set; }
    public string? Observacion { get; set; }

    // IAuditableCommand
    public string EntidadAfectada => "TemperaturaRegistro";
    public string RegistroId => (RecepcionId ?? LoteRecibidoId ?? Guid.Empty).ToString();
}

public sealed class RegistrarTemperaturaCommandValidator : AbstractValidator<RegistrarTemperaturaCommand>
{
    public RegistrarTemperaturaCommandValidator()
    {
        RuleFor(x => x)
            .Must(x => x.RecepcionId.HasValue || x.LoteRecibidoId.HasValue)
            .WithMessage("El registro debe estar asociado a una recepción o a un lote.")
            .OverridePropertyName("Asociacion");

        RuleFor(x => x.Temperatura)
            .InclusiveBetween(-40m, 60m)
            .WithMessage("La temperatura debe estar entre -40°C y 60°C.");

        RuleFor(x => x.UnidadMedida)
            .NotEmpty().WithMessage("La unidad de medida es obligatoria.")
            .Must(u => u == "°C" || u == "°F")
            .WithMessage("La unidad de medida debe ser °C o °F.");

        RuleFor(x => x.DispositivoId)
            .MaximumLength(100).WithMessage("El ID del dispositivo no puede superar 100 caracteres.")
            .When(x => x.DispositivoId is not null);

        RuleFor(x => x.Observacion)
            .MaximumLength(300).WithMessage("La observación no puede superar 300 caracteres.")
            .When(x => x.Observacion is not null);
    }
}

public sealed class RegistrarTemperaturaCommandHandler : IRequestHandler<RegistrarTemperaturaCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public RegistrarTemperaturaCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(
        RegistrarTemperaturaCommand request,
        CancellationToken cancellationToken)
    {
        bool estaFueraDeRango = false;

        // Verificar rango si viene asociado a un lote con categoría configurada
        if (request.LoteRecibidoId.HasValue)
        {
            var lote = await _unitOfWork.Lotes.GetByIdAsync(request.LoteRecibidoId.Value)
                ?? throw new Domain.Exceptions.BusinessRuleException(
                    $"No se encontró el lote con ID '{request.LoteRecibidoId}'.");

            var item = await _unitOfWork.Items.GetByIdAsync(lote.ItemId);
            if (item?.RangoTemperatura is not null)
                estaFueraDeRango = item.RangoTemperatura.EstaFueraDeRango(request.Temperatura);
        }
        else if (request.RecepcionId.HasValue)
        {
            _ = await _unitOfWork.Recepciones.GetByIdAsync(request.RecepcionId.Value)
                ?? throw new Domain.Exceptions.Recepciones.RecepcionNotFoundException(request.RecepcionId.Value);
        }

        var registro = new TemperaturaRegistro
        {
            RecepcionId = request.RecepcionId,
            LoteRecibidoId = request.LoteRecibidoId,
            Temperatura = request.Temperatura,
            UnidadMedida = request.UnidadMedida,
            FechaHora = DateTime.UtcNow,
            Origen = request.Origen,
            DispositivoId = request.DispositivoId,
            EstaFueraDeRango = estaFueraDeRango,
            Observacion = request.Observacion?.Trim(),
            RegistradoPor = request.Origen == OrigenTemperatura.Manual
                ? _currentUser.UserId
                : null
        };

        await _unitOfWork.Temperaturas.AddAsync(registro);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return registro.Id;
    }
}