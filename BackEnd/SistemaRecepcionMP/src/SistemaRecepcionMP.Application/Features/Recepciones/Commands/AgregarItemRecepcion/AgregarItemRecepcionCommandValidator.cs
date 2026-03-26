using FluentValidation;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.AgregarItemRecepcion;

public class AgregarItemRecepcionValidator 
    : AbstractValidator<AgregarItemRecepcionCommand>
{
    public AgregarItemRecepcionValidator()
    {
        RuleFor(x => x.RecepcionId)
            .NotEmpty();

        RuleFor(x => x.DetalleOrdenCompraId)
            .NotEmpty();
    }
}