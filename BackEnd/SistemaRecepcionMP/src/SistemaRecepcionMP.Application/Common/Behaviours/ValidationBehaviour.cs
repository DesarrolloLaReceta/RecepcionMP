using FluentValidation;
using MediatR;
using ValidationException = SistemaRecepcionMP.Application.Common.Exceptions.ValidationException;

namespace SistemaRecepcionMP.Application.Common.Behaviours;

/// <summary>
/// Intercepta cada Command/Query antes de que llegue al Handler.
/// Ejecuta todos los validadores de FluentValidation registrados para ese request.
/// Si hay errores lanza ValidationException y el Handler nunca se ejecuta.
/// </summary>
public sealed class ValidationBehaviour<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehaviour(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        // Si no hay validadores registrados para este request, continúa directamente
        if (!_validators.Any())
            return await next();

        // Ejecuta todos los validadores en paralelo
        var context = new ValidationContext<TRequest>(request);

        var validationResults = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, cancellationToken)));

        // Agrupa todos los errores por nombre de campo
        var failures = validationResults
            .Where(result => result.Errors.Any())
            .SelectMany(result => result.Errors)
            .GroupBy(
                failure => failure.PropertyName,
                failure => failure.ErrorMessage)
            .ToDictionary(
                group => group.Key,
                group => group.ToArray());

        if (failures.Any())
            throw new ValidationException(failures);

        return await next();
    }
}