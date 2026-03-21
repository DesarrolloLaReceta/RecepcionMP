using MediatR;
using SistemaRecepcionMP.Application.Common.Behaviours;
using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Interfaces;
using FluentValidation;

namespace SistemaRecepcionMP.Application.Features.NoConformidades.Commands;

public sealed class AgregarComentarioNCCommand : IRequest<Guid>, IAuditableCommand
{
    public Guid NoConformidadId { get; set; }
    public string Texto { get; set; } = string.Empty;

    public string EntidadAfectada => "ComentarioNC";
    public string RegistroId => NoConformidadId.ToString();
}

public sealed class AgregarComentarioNCCommandValidator
    : AbstractValidator<AgregarComentarioNCCommand>
{
    public AgregarComentarioNCCommandValidator()
    {
        RuleFor(x => x.NoConformidadId).NotEmpty();
        RuleFor(x => x.Texto)
            .NotEmpty().WithMessage("El comentario no puede estar vacío.")
            .MaximumLength(1000);
    }
}

public sealed class AgregarComentarioNCCommandHandler
    : IRequestHandler<AgregarComentarioNCCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public AgregarComentarioNCCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(AgregarComentarioNCCommand request, CancellationToken cancellationToken)
    {
        var nc = await _unitOfWork.NoConformidades.GetByIdAsync(request.NoConformidadId)
            ?? throw new KeyNotFoundException($"NC {request.NoConformidadId} no encontrada.");

        var comentario = new ComentarioNoConformidad
        {
            NoConformidadId = request.NoConformidadId,
            Texto           = request.Texto.Trim(),
            AutorId         = _currentUser.UserId,
            FechaRegistro   = DateTime.UtcNow,
        };

        await _unitOfWork.NoConformidades.AgregarComentarioAsync(comentario);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return comentario.Id;
    }
}