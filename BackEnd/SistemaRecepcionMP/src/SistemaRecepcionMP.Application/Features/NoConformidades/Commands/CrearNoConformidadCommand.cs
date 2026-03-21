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
    public string Titulo { get; set; } = string.Empty;
    public TipoNoConformidad Tipo { get; set; }
    public PrioridadNoConformidad Prioridad { get; set; }
    public Guid CausalId { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public decimal CantidadAfectada { get; set; }
    public string? AsignadoA { get; set; }
    public DateOnly? FechaLimite { get; set; }
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
        RuleFor(x => x.Titulo)
            .NotEmpty().WithMessage("El título es obligatorio.")
            .MaximumLength(200);
        RuleFor(x => x.Tipo)
            .IsInEnum().WithMessage("El tipo no es válido.");
        RuleFor(x => x.Prioridad)
            .IsInEnum().WithMessage("La prioridad no es válida.");
        RuleFor(x => x.CausalId)
            .NotEmpty().WithMessage("La causal es obligatoria.");
        RuleFor(x => x.Descripcion)
            .NotEmpty().WithMessage("La descripción es obligatoria.")
            .MaximumLength(500);
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
        var lote = await _unitOfWork.Lotes.GetByIdAsync(request.LoteRecibidoId)
            ?? throw new LoteNotFoundException(request.LoteRecibidoId);

        if (lote.Estado == EstadoLote.Liberado)
            throw new LoteYaLiberadoException(lote.CodigoLoteInterno);

        // Generar número consecutivo
        var count = (await _unitOfWork.NoConformidades.GetAllAsync()).Count();
        var numero = $"NC-{DateTime.UtcNow.Year}-{(count + 1):D4}";

        var nc = new NoConformidad
        {
            Numero           = numero,
            Titulo           = request.Titulo.Trim(),
            LoteRecibidoId   = request.LoteRecibidoId,
            Tipo             = request.Tipo,
            Prioridad        = request.Prioridad,
            CausalId         = request.CausalId,
            Descripcion      = request.Descripcion.Trim(),
            CantidadAfectada = request.CantidadAfectada,
            AsignadoA        = request.AsignadoA?.Trim(),
            FechaLimite      = request.FechaLimite,
            Estado           = EstadoNoConformidad.Abierta,
            CreadoPor        = _currentUser.UserId,
            CreadoEn         = DateTime.UtcNow,
        };

        await _unitOfWork.NoConformidades.AddAsync(nc);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return nc.Id;
    }
}