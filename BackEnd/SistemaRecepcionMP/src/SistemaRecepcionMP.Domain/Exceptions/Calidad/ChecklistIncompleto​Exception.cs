namespace SistemaRecepcionMP.Domain.Exceptions.Calidad;

public sealed class ChecklistIncompletoException : DomainException
{
    public ChecklistIncompletoException(string codigoLote, int itemsPendientes)
        : base($"El checklist del lote '{codigoLote}' tiene {itemsPendientes} ítem(s) sin responder. " +
               $"Todos los ítems deben ser diligenciados antes de continuar.") { }

    public ChecklistIncompletoException(string codigoLote, IEnumerable<string> criteriosCriticosPendientes)
        : base($"El lote '{codigoLote}' tiene ítems críticos sin responder: " +
               $"{string.Join(", ", criteriosCriticosPendientes)}. " +
               $"Los ítems críticos son obligatorios para avanzar el estado del lote.") { }
}