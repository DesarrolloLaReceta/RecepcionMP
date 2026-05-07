using SistemaRecepcionMP.Application.Common.Behaviours;
using SistemaRecepcionMP.Application.Common.Exceptions;
using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Exceptions.Calidad;
using SistemaRecepcionMP.Domain.Exceptions.Lotes;
using SistemaRecepcionMP.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands;

// ─── Command ────────────────────────────────────────────────────────────────

public sealed class LiberarLoteCommand : IRequest, IAuditableCommand
{
    public Guid LoteId { get; set; }
    public DecisionLiberacion Decision { get; set; }
    public string? Observaciones { get; set; }

    // IAuditableCommand
    public string EntidadAfectada => "LoteRecibido";
    public string RegistroId => LoteId.ToString();
}

// ─── Validator ───────────────────────────────────────────────────────────────

public sealed class LiberarLoteCommandValidator : AbstractValidator<LiberarLoteCommand>
{
    public LiberarLoteCommandValidator()
    {
        RuleFor(x => x.LoteId)
            .NotEmpty().WithMessage("El ID del lote es obligatorio.");

        RuleFor(x => x.Decision)
            .IsInEnum().WithMessage("La decisión de liberación no es válida.");

        RuleFor(x => x.Observaciones)
            .NotEmpty().WithMessage("Las observaciones son obligatorias al rechazar un lote.")
            .When(x => x.Decision == DecisionLiberacion.RechazadoDefinitivo);

        RuleFor(x => x.Observaciones)
            .MaximumLength(500).WithMessage("Las observaciones no pueden superar 500 caracteres.")
            .When(x => x.Observaciones is not null);
    }
}

// ─── Handler ─────────────────────────────────────────────────────────────────

public sealed class LiberarLoteCommandHandler : IRequestHandler<LiberarLoteCommand>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;
    private readonly IEmailService _emailService;

    public LiberarLoteCommandHandler(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUser,
        IEmailService emailService)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
        _emailService = emailService;
    }

    public async Task Handle(LiberarLoteCommand request, CancellationToken cancellationToken)
    {
        // 1. Solo el perfil Calidad puede liberar lotes
        if (!_currentUser.TienePerfil(PerfilUsuario.Calidad))
            throw new LiberacionNoAutorizadaException(_currentUser.Nombre);

        // 2. Obtener lote
        var lote = await _unitOfWork.Lotes.GetByIdAsync(request.LoteId)
            ?? throw new LoteNotFoundException(request.LoteId);

        // 3. Verificar estado permite liberación
        if (lote.Estado == EstadoLote.Liberado)
            throw new LoteYaLiberadoException(lote.CodigoLoteInterno);

        if (lote.Estado == EstadoLote.EnCuarentena)
            throw new LoteNoDisponibleException(lote.CodigoLoteInterno, EstadoLote.EnCuarentena);

        if (lote.Estado == EstadoLote.RechazadoTotal)
            throw new LoteNoDisponibleException(lote.CodigoLoteInterno, EstadoLote.RechazadoTotal);

        // 4. Verificar que no hay no conformidades abiertas bloqueantes
        var ncAbiertas = await _unitOfWork.NoConformidades
            .GetByEstadoAsync(EstadoNoConformidad.Abierta);

        var ncDelLote = ncAbiertas
            .Where(nc => nc.LoteRecibidoId == lote.Id)
            .ToList();

        if (ncDelLote.Any() && request.Decision == DecisionLiberacion.Liberado)
            throw new NoConformidadNoSolucionadaException(lote.CodigoLoteInterno, ncDelLote.Count);

        // 5. Llamar al método de dominio en el lote
        switch (request.Decision)
        {
            case DecisionLiberacion.Liberado:
                lote.Liberar();
                break;
            case DecisionLiberacion.RechazadoDefinitivo:
                lote.Rechazar(lote.CantidadRecibida!);
                break;
        }

        // 6. Registrar la liberación formal
        var liberacion = new LiberacionLote
        {
            LoteRecibidoId = lote.Id,
            Decision = request.Decision,
            Observaciones = request.Observaciones?.Trim(),
            LiberadoPor = _currentUser.UserId,
            FechaLiberacion = DateTime.UtcNow
        };

        lote.AgregarLiberacion(liberacion);
        _unitOfWork.Lotes.Update(lote);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // 7. Notificar si fue rechazado definitivamente
        if (request.Decision == DecisionLiberacion.RechazadoDefinitivo)
        {
            var recepcion = await _unitOfWork.Recepciones.GetByIdAsync(lote.Recepcion.Id);
            if (recepcion?.Proveedor?.EmailContacto is not null)
            {
                var cuerpo = $"""
                             <p>El lote <strong>{lote.CodigoLoteInterno}</strong> fue rechazado.</p>
                             <p><strong>Motivo:</strong> {request.Observaciones ?? string.Empty}</p>
                             <p><strong>Responsable:</strong> {_currentUser.Nombre}</p>
                             """;

                await _emailService.EnviarAsync(
                    new EmailMessage(
                        Destinatario: recepcion.Proveedor.EmailContacto,
                        Asunto: "Notificación: Lote rechazado en recepción",
                        Cuerpo: cuerpo,
                        EsHtml: true),
                    cancellationToken);
            }
        }
    }
}