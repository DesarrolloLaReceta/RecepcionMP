using SistemaRecepcionMP.Application.Common.Behaviours;
using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Interfaces;
using FluentValidation;
using MediatR;
using AppValidationException = SistemaRecepcionMP.Application.Common.Exceptions.ValidationException;

namespace SistemaRecepcionMP.Application.Features.NoConformidades.Commands;

// ─── Command ────────────────────────────────────────────────────────────────

public sealed class CerrarNoConformidadCommand : IRequest, IAuditableCommand
{
    public Guid NoConformidadId { get; set; }
    public Guid AccionCorrectivaId { get; set; }
    public string EvidenciaUrl { get; set; } = string.Empty;
    public string? ObservacionCierre { get; set; }

    // IAuditableCommand
    public string EntidadAfectada => "NoConformidad";
    public string RegistroId => NoConformidadId.ToString();
}

// ─── Validator ───────────────────────────────────────────────────────────────

public sealed class CerrarNoConformidadCommandValidator
    : AbstractValidator<CerrarNoConformidadCommand>
{
    public CerrarNoConformidadCommandValidator()
    {
        RuleFor(x => x.NoConformidadId)
            .NotEmpty().WithMessage("La no conformidad es obligatoria.");

        RuleFor(x => x.AccionCorrectivaId)
            .NotEmpty().WithMessage("La acción correctiva de cierre es obligatoria.");

        RuleFor(x => x.EvidenciaUrl)
            .NotEmpty().WithMessage("La URL de evidencia es obligatoria.")
            .MaximumLength(500).WithMessage("La URL no puede superar 500 caracteres.");

        RuleFor(x => x.ObservacionCierre)
            .MaximumLength(500).WithMessage("La observación no puede superar 500 caracteres.")
            .When(x => x.ObservacionCierre is not null);
    }
}

// ─── Handler ─────────────────────────────────────────────────────────────────

public sealed class CerrarNoConformidadCommandHandler : IRequestHandler<CerrarNoConformidadCommand>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public CerrarNoConformidadCommandHandler(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task Handle(
        CerrarNoConformidadCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Verificar no conformidad existe y no está ya cerrada
        var noConformidad = await _unitOfWork.NoConformidades.GetByIdAsync(request.NoConformidadId)
            ?? throw new AppValidationException("NoConformidadId",
                $"No se encontró la no conformidad con ID '{request.NoConformidadId}'.");

        if (noConformidad.Estado == EstadoNoConformidad.Cerrada)
            throw new AppValidationException("NoConformidadId",
                "La no conformidad ya está cerrada.");

        // 2. Verificar acción correctiva pertenece a esta NC y está pendiente
        var accion = noConformidad.AccionesCorrectivas
            .FirstOrDefault(a => a.Id == request.AccionCorrectivaId)
            ?? throw new AppValidationException("AccionCorrectivaId",
                "La acción correctiva no pertenece a esta no conformidad.");

        if (accion.Estado == EstadoAccionCorrectiva.Cerrada)
            throw new AppValidationException("AccionCorrectivaId",
                "La acción correctiva ya fue cerrada.");

        // 3. Cerrar la acción correctiva con evidencia
        accion.Estado = EstadoAccionCorrectiva.Cerrada;
        accion.FechaCierre = DateOnly.FromDateTime(DateTime.UtcNow);
        accion.EvidenciaUrl = request.EvidenciaUrl;

        // 4. Verificar que todas las demás acciones también están cerradas
        var todasCerradas = noConformidad.AccionesCorrectivas
            .All(a => a.Estado == EstadoAccionCorrectiva.Cerrada);

        // 5. Cerrar la no conformidad solo si todas las acciones están cerradas
        if (todasCerradas)
            noConformidad.Estado = EstadoNoConformidad.Cerrada;

        _unitOfWork.NoConformidades.Update(noConformidad);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}