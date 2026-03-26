using SistemaRecepcionMP.Domain.Exceptions;

namespace SistemaRecepcionMP.Domain.Entities;

public class Factura : BaseEntity
{
    public Guid RecepcionId { get; private set; }
    public string NumeroFactura { get; private set; } = string.Empty;
    public DateOnly FechaFactura { get; private set; }
    public decimal ValorTotal { get; private set; }

    public string? AdjuntoUrl { get; private set; }

    public string? NotaCreditoNumero { get; private set; }
    public decimal? NotaCreditoValor { get; private set; }

    public Recepcion Recepcion { get; private set; } = null!;

    public Factura(string numeroFactura, DateOnly fecha, decimal valor)
    {
        if (string.IsNullOrWhiteSpace(numeroFactura))
            throw new BusinessRuleException("El número de factura es obligatorio.");

        if (valor <= 0)
            throw new BusinessRuleException("El valor debe ser mayor a cero.");

        NumeroFactura = numeroFactura;
        FechaFactura = fecha;
        ValorTotal = valor;
    }

    public void AplicarNotaCredito(string numero, decimal valor)
    {
        if (valor <= 0)
            throw new BusinessRuleException("La nota crédito debe ser mayor a cero.");

        NotaCreditoNumero = numero;
        NotaCreditoValor = valor;
    }

    public void SetRecepcion(Guid recepcionId)
    {
        if (RecepcionId != Guid.Empty)
            throw new BusinessRuleException("La factura ya está asociada a una recepción.");

        RecepcionId = recepcionId;
    }
}