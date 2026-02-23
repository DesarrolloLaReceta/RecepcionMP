using SistemaRecepcionMP.Application.Common.Behaviours;
using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Interfaces;
using FluentValidation;
using MediatR;
using AppValidationException = SistemaRecepcionMP.Application.Common.Exceptions.ValidationException;

namespace SistemaRecepcionMP.Application.Features.NoConformidades.Commands;

// ─── Command ────────────────────────────────────────────────────────────────

public sealed class CrearAccionCorrectivaCommand : IRequest<Guid>, IAuditableCommand
{
    public Guid NoConformidadId { get; set; }
    public string DescripcionAccion { get; set; } = string.Empty;
    public Guid ResponsableId { get; set; }
    public DateOnly FechaCompromiso { get; set; }

    // IAuditableCommand
    public string EntidadAfectada => "AccionCorrectiva";
    public string RegistroId => NoConformidadId.ToString();
}

// ─── Validator ───────────────────────────────────────────────────────────────

public sealed class CrearAccionCorrectivaCommandValidator
    : AbstractValidator<CrearAccionCorrectivaCommand>
{
    public CrearAccionCorrectivaCommandValidator()
    {
        RuleFor(x => x.NoConformidadId)
            .NotEmpty().WithMessage("La no conformidad es obligatoria.");

        RuleFor(x => x.DescripcionAccion)
            .NotEmpty().WithMessage("La descripción de la acción es obligatoria.")
            .MaximumLength(500).WithMessage("La descripción no puede superar 500 caracteres.");

        RuleFor(x => x.ResponsableId)
            .NotEmpty().WithMessage("El responsable es obligatorio.");

        RuleFor(x => x.FechaCompromiso)
            .NotEmpty().WithMessage("La fecha de compromiso es obligatoria.")
            .GreaterThan(DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("La fecha de compromiso debe ser futura.");
    }
}

// ─── Handler ─────────────────────────────────────────────────────────────────

public sealed class CrearAccionCorrectivaCommandHandler
    : IRequestHandler<CrearAccionCorrectivaCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public CrearAccionCorrectivaCommandHandler(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(
        CrearAccionCorrectivaCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Verificar no conformidad existe y está abierta
        var noConformidad = await _unitOfWork.NoConformidades.GetByIdAsync(request.NoConformidadId)
            ?? throw new AppValidationException("NoConformidadId",
                $"No se encontró la no conformidad con ID '{request.NoConformidadId}'.");

        if (noConformidad.Estado == EstadoNoConformidad.Cerrada)
            throw new AppValidationException("NoConformidadId",
                "No se puede agregar una acción correctiva a una no conformidad cerrada.");

        // 2. Verificar que el responsable existe
        var responsable = await _unitOfWork.Usuarios.GetByIdAsync(request.ResponsableId)
            ?? throw new AppValidationException("ResponsableId",
                $"No se encontró el usuario responsable con ID '{request.ResponsableId}'.");

        var accion = new AccionCorrectiva
        {
            NoConformidadId = noConformidad.Id,
            DescripcionAccion = request.DescripcionAccion.Trim(),
            ResponsableId = request.ResponsableId,
            FechaCompromiso = request.FechaCompromiso,
            Estado = EstadoAccionCorrectiva.Pendiente
        };

        // Cambiar estado de la NC a EnGestion si estaba Abierta
        if (noConformidad.Estado == EstadoNoConformidad.Abierta)
            noConformidad.Estado = EstadoNoConformidad.EnProceso;

        noConformidad.AccionesCorrectivas.Add(accion);
        _unitOfWork.NoConformidades.Update(noConformidad);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return accion.Id;
    }
}