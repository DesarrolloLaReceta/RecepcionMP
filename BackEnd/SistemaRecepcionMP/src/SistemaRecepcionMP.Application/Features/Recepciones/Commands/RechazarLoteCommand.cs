using SistemaRecepcionMP.Application.Common.Behaviours;
using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Exceptions;
using SistemaRecepcionMP.Domain.Exceptions.Lotes;
using SistemaRecepcionMP.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands;

// ─── Command ────────────────────────────────────────────────────────────────

public sealed class RechazarLoteCommand : IRequest, IAuditableCommand
{
    public Guid LoteId { get; set; }
    public Guid CausalId { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public decimal CantidadAfectada { get; set; }

    // IAuditableCommand
    public string EntidadAfectada => "LoteRecibido";
    public string RegistroId => LoteId.ToString();
}

// ─── Validator ───────────────────────────────────────────────────────────────

public sealed class RechazarLoteCommandValidator : AbstractValidator<RechazarLoteCommand>
{
    public RechazarLoteCommandValidator()
    {
        RuleFor(x => x.LoteId)
            .NotEmpty().WithMessage("El ID del lote es obligatorio.");

        RuleFor(x => x.CausalId)
            .NotEmpty().WithMessage("La causal de no conformidad es obligatoria.");

        RuleFor(x => x.Descripcion)
            .NotEmpty().WithMessage("La descripción del rechazo es obligatoria.")
            .MaximumLength(500).WithMessage("La descripción no puede superar 500 caracteres.");

        RuleFor(x => x.CantidadAfectada)
            .GreaterThan(0).WithMessage("La cantidad afectada debe ser mayor a 0.");
    }
}

// ─── Handler ─────────────────────────────────────────────────────────────────

public sealed class RechazarLoteCommandHandler : IRequestHandler<RechazarLoteCommand>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public RechazarLoteCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task Handle(RechazarLoteCommand request, CancellationToken cancellationToken)
    {
        // 1. Obtener lote y verificar que puede rechazarse
        var lote = await _unitOfWork.Lotes.GetByIdAsync(request.LoteId)
            ?? throw new LoteNotFoundException(request.LoteId);

        if (lote.Estado == EstadoLote.Liberado)
            throw new LoteYaLiberadoException(lote.CodigoLoteInterno);

        // FIX E1 + E2: el valor correcto del enum es RechazadoDefinitivo, no Rechazado.
        // LoteNoDisponibleException recibe (string codigoLote, EstadoLote estado), no string.
        if (lote.Estado == EstadoLote.RechazadoTotal)
            throw new LoteNoDisponibleException(lote.CodigoLoteInterno, EstadoLote.RechazadoTotal);

        // 2. Verificar causal existe
        var causal = await _unitOfWork.NoConformidades.GetByIdAsync(request.CausalId)
            ?? throw new BusinessRuleException(
                $"No se encontró la causal con ID '{request.CausalId}'.");

        // 3. Verificar que cantidad afectada no supera lo recibido
        if (request.CantidadAfectada > lote.CantidadRecibida)
            throw new BusinessRuleException(
                $"La cantidad afectada ({request.CantidadAfectada}) no puede superar " +
                $"la cantidad recibida ({lote.CantidadRecibida}).");

        // 4. Crear no conformidad
        // FIX E3: el valor correcto es RechazoEnRecepcion, no Rechazo.
        var noConformidad = new NoConformidad
        {
            LoteRecibidoId = lote.Id,
            Tipo = TipoNoConformidad.RechazoTotal,
            CausalId = request.CausalId,
            Descripcion = request.Descripcion.Trim(),
            CantidadAfectada = request.CantidadAfectada,
            Estado = EstadoNoConformidad.Abierta,
            CreadoPor = _currentUser.UserId,
            CreadoEn = DateTime.UtcNow
        };

        // FIX E4 + E5: CantidadRechazada tiene private set y Rechazar() recibe decimal.
        // lote.Rechazar(decimal) actualiza internamente CantidadRechazada y Estado.
        // ⚠️ Reemplaza el valor si tu enum usa un nombre distinto a RechazadoDefinitivo.
        lote.Rechazar(request.CantidadAfectada);

        lote.NoConformidades.Add(noConformidad);
        _unitOfWork.Lotes.Update(lote);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}