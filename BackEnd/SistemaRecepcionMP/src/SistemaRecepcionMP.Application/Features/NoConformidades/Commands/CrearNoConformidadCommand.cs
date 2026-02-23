using SistemaRecepcionMP.Application.Common.Behaviours;
using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Exceptions.Lotes;
using SistemaRecepcionMP.Domain.Interfaces;
using FluentValidation;
using MediatR;
using AppValidationException = SistemaRecepcionMP.Application.Common.Exceptions.ValidationException;

namespace SistemaRecepcionMP.Application.Features.NoConformidades.Commands;

// ─── Command ────────────────────────────────────────────────────────────────

public sealed class CrearNoConformidadCommand : IRequest<Guid>, IAuditableCommand
{
    public Guid LoteRecibidoId { get; set; }
    public TipoNoConformidad Tipo { get; set; }
    public Guid CausalId { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public decimal CantidadAfectada { get; set; }

    // IAuditableCommand
    public string EntidadAfectada => "NoConformidad";
    public string RegistroId => LoteRecibidoId.ToString();
}

// ─── Validator ───────────────────────────────────────────────────────────────

public sealed class CrearNoConformidadCommandValidator
    : AbstractValidator<CrearNoConformidadCommand>
{
    public CrearNoConformidadCommandValidator()
    {
        RuleFor(x => x.LoteRecibidoId)
            .NotEmpty().WithMessage("El lote es obligatorio.");

        RuleFor(x => x.Tipo)
            .IsInEnum().WithMessage("El tipo de no conformidad no es válido.");

        RuleFor(x => x.CausalId)
            .NotEmpty().WithMessage("La causal es obligatoria.");

        RuleFor(x => x.Descripcion)
            .NotEmpty().WithMessage("La descripción es obligatoria.")
            .MaximumLength(500).WithMessage("La descripción no puede superar 500 caracteres.");

        RuleFor(x => x.CantidadAfectada)
            .GreaterThan(0).WithMessage("La cantidad afectada debe ser mayor a 0.");
    }
}

// ─── Handler ─────────────────────────────────────────────────────────────────

public sealed class CrearNoConformidadCommandHandler
    : IRequestHandler<CrearNoConformidadCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public CrearNoConformidadCommandHandler(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(
        CrearNoConformidadCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Verificar lote existe
        var lote = await _unitOfWork.Lotes.GetByIdAsync(request.LoteRecibidoId)
            ?? throw new LoteNotFoundException(request.LoteRecibidoId);

        // 2. Verificar que lote no está liberado
        if (lote.Estado == EstadoLote.Liberado)
            throw new LoteYaLiberadoException(lote.CodigoLoteInterno);

        // 3. Verificar causal existe y está activa
        var causal = await _unitOfWork.NoConformidades.GetByIdAsync(request.CausalId)
            ?? throw new AppValidationException("CausalId",
                $"No se encontró la causal con ID '{request.CausalId}'.");

        // 4. Verificar cantidad no supera lo recibido
        if (request.CantidadAfectada > lote.CantidadRecibida)
            throw new AppValidationException("CantidadAfectada",
                $"La cantidad afectada ({request.CantidadAfectada}) no puede superar " +
                $"la cantidad recibida ({lote.CantidadRecibida}).");

        var noConformidad = new NoConformidad
        {
            LoteRecibidoId = lote.Id,
            Tipo = request.Tipo,
            CausalId = request.CausalId,
            Descripcion = request.Descripcion.Trim(),
            CantidadAfectada = request.CantidadAfectada,
            Estado = EstadoNoConformidad.Abierta,
            CreadoPor = _currentUser.UserId,
            CreadoEn = DateTime.UtcNow
        };

        lote.NoConformidades.Add(noConformidad);
        _unitOfWork.Lotes.Update(lote);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return noConformidad.Id;
    }
}