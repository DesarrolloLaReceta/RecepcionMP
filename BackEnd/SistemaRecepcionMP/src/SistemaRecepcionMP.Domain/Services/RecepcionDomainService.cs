using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Exceptions;

namespace SistemaRecepcionMP.Domain.Services;

public class RecepcionDomainService
{
    /// <summary>
    /// Coordina la validación de un lote físico contra las reglas del maestro de ítems
    /// y lo agrega al ítem de recepción correspondiente.
    /// </summary>
    public void ValidarYAgregarLote(RecepcionItem itemDestino, LoteRecibido nuevoLote, Item maestroItem)
    {
        // 1. Validar Vida Útil (Regla de negocio crítica para alimentos en La Receta)
        // Ahora usamos el Value Object VidaUtil que ya sabe calcular sus días restantes.
        
        if (nuevoLote.VidaUtil == null)
        {
            throw new BusinessRuleException("El lote no tiene información de vida útil definida.");
        }

        if (nuevoLote.VidaUtil.DiasRestantes < maestroItem.VidaUtilDias)
        {
            throw new BusinessRuleException(
                $"El lote {nuevoLote.NumeroLoteProveedor} no cumple con la vida útil mínima. " +
                $"Requerido: {maestroItem.VidaUtilDias} días, Recibido: {nuevoLote.VidaUtil.DiasRestantes} días.");
        }

        // 2. Validar Temperatura (Si el ítem tiene un rango definido)
        if (maestroItem.RangoTemperatura != null && nuevoLote.TemperaturaMedida.HasValue)
        {
            if (!maestroItem.RangoTemperatura.ContieneValor(nuevoLote.TemperaturaMedida.Value))
            {
                throw new BusinessRuleException(
                    $"La temperatura {nuevoLote.TemperaturaMedida}°C está fuera del rango permitido " +
                    $"para {maestroItem.Nombre}.");
            }
        }

        // 3. Si todo está OK, procedemos a agregarlo al itemDestino
        itemDestino.AgregarLote(nuevoLote);
    }
}