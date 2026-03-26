using FluentValidation;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.IniciarRecepcion;

public class IniciarRecepcionValidator : AbstractValidator<IniciarRecepcionCommand>
{
    public IniciarRecepcionValidator()
    {
        RuleFor(x => x.OrdenCompraId)
            .NotEmpty();

        RuleFor(x => x.ProveedorId)
            .NotEmpty();

        RuleFor(x => x.UsuarioId)
            .NotEmpty();

        RuleFor(x => x.ObservacionesGenerales)
            .MaximumLength(500);
    }
}