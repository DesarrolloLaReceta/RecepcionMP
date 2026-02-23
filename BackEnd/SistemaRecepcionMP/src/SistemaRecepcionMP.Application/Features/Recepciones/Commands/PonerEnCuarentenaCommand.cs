using SistemaRecepcionMP.Application.Common.Behaviours;
using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.Exceptions.Lotes;
using SistemaRecepcionMP.Domain.Interfaces;
using FluentValidation;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands;

// ─── Command ────────────────────────────────────────────────────────────────

public sealed class PonerEnCuarentenaCommand : IRequest<Guid>, IAuditableCommand
{
    public Guid LoteId { get; set; }
    public string Motivo { get; set; } = string.Empty;

    // IAuditableCommand
    public string EntidadAfectada => "Cuarentena";
    public string RegistroId => LoteId.ToString();
}

// ─── Validator ───────────────────────────────────────────────────────────────

public sealed class PonerEnCuarentenaCommandValidator : AbstractValidator<PonerEnCuarentenaCommand>
{
    public PonerEnCuarentenaCommandValidator()
    {
        RuleFor(x => x.LoteId)
            .NotEmpty().WithMessage("El ID del lote es obligatorio.");

        RuleFor(x => x.Motivo)
            .NotEmpty().WithMessage("El motivo de cuarentena es obligatorio.")
            .MaximumLength(500).WithMessage("El motivo no puede superar 500 caracteres.");
    }
}

// ─── Handler ─────────────────────────────────────────────────────────────────

public sealed class PonerEnCuarentenaCommandHandler : IRequestHandler<PonerEnCuarentenaCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public PonerEnCuarentenaCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(PonerEnCuarentenaCommand request, CancellationToken cancellationToken)
    {
        // 1. Solo Calidad puede poner en cuarentena
        // FIX E1: ForbiddenAccessException vive en Application.Common.Exceptions, no en Domain
        if (!_currentUser.TieneAlgunPerfil(PerfilUsuario.Calidad, PerfilUsuario.Administrador))
            throw new Application.Common.Exceptions.ForbiddenAccessException(
                PerfilUsuario.Calidad, _currentUser.Perfil);

        // 2. Obtener lote
        var lote = await _unitOfWork.Lotes.GetByIdAsync(request.LoteId)
            ?? throw new LoteNotFoundException(request.LoteId);

        // 3. Verificar estado permite cuarentena
        // FIX E2, E3, E4: EstadoLote usa RechazadoDefinitivo, no Rechazado.
        // LoteNoDisponibleException recibe (string, EstadoLote), no (string, string).
        if (lote.Estado == EstadoLote.Liberado)
            throw new LoteYaLiberadoException(lote.CodigoLoteInterno);

        if (lote.Estado == EstadoLote.RechazadoTotal)
            throw new LoteNoDisponibleException(lote.CodigoLoteInterno, EstadoLote.RechazadoTotal);

        if (lote.Estado == EstadoLote.EnCuarentena)
            throw new LoteNoDisponibleException(lote.CodigoLoteInterno, EstadoLote.EnCuarentena);

        // 4. Llamar método de dominio
        lote.PonerEnCuarentena();

        // 5. Crear registro de cuarentena
        // FIX E5: Cuarentena tiene private set — se asigna con AgregarCuarentena().
        // Agrega este método en Domain/Entities/LoteRecibido.cs:
        //   public void AgregarCuarentena(Cuarentena cuarentena) => Cuarentena = cuarentena;
        var cuarentena = new Cuarentena
        {
            LoteRecibidoId = lote.Id,
            FechaCuarentena = DateOnly.FromDateTime(DateTime.UtcNow),
            Motivo = request.Motivo.Trim(),
            SeguidoPor = _currentUser.UserId
        };

        lote.AgregarCuarentena(cuarentena);
        _unitOfWork.Lotes.Update(lote);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return cuarentena.Id;
    }
}