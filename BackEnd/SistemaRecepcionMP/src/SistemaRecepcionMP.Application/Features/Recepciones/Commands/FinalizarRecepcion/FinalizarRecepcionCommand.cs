using MediatR;
using SistemaRecepcionMP.Application.Common.Behaviours;
using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.FinalizarRecepcion;

public sealed class FinalizarRecepcionCommand : IRequest<FinalizarRecepcionResult>, IAuditableCommand
{
    public Guid RecepcionId { get; set; }

    public string EntidadAfectada => "Recepcion";
    public string RegistroId => RecepcionId.ToString();
}

public sealed record FinalizarRecepcionResult(
    FinalizarRecepcionEstado Resultado,
    Guid RecepcionId,
    IReadOnlyCollection<ExcedenteDetectadoDetalle>? Excedentes = null
);

public enum FinalizarRecepcionEstado
{
    Finalizada = 0,
    ExcedenteDetectado = 1
}

public sealed record ExcedenteDetectadoDetalle(
    Guid RecepcionItemId,
    Guid ItemId,
    decimal CantidadFisica,
    decimal CantidadSiesa,
    decimal Diferencia,
    string UnidadMedida
);