using System;
using System.Linq;
using RecepcionMP.Application.DTOs;
using RecepcionMP.Application.Interfaces;
using RecepcionMP.Application.Interfaces.Repositories;

namespace RecepcionMP.Application.Services;

public class TrazabilidadService : ITrazabilidadService
{
    private readonly IRecepcionRepository _recepcionRepo;
    private readonly ILoteRepository _loteRepo;
    private readonly IOrdenCompraRepository _ocRepo;
    private readonly IProveedorRepository _provRepo;

    public TrazabilidadService(IRecepcionRepository recepcionRepo, ILoteRepository loteRepo, IOrdenCompraRepository ocRepo, IProveedorRepository provRepo)
    {
        _recepcionRepo = recepcionRepo;
        _loteRepo = loteRepo;
        _ocRepo = ocRepo;
        _provRepo = provRepo;
    }

        public async Task<TrazabilidadDto> ObtenerTrazaProveedor(int proveedorId, DateTime desde, DateTime hasta)
    {
        var traz = new TrazabilidadDto();

        var recepciones = await _recepcionRepo.ObtenerPorProveedorAsync(proveedorId, desde, hasta);
        var recepDtos = recepciones.Select(r => new TrazabilidadDto.RecepcionResumenDto
        {
            Id = r.Id,
                Fecha = r.FechaRecepcion,
            OrdenCompraId = r.OrdenCompraId,
            OrdenCompraNumero = r.OrdenCompra?.NumeroOrden,
            FacturaId = r.FacturaId,
            FacturaNumero = r.Factura?.NumeroFactura,
            ProveedorId = proveedorId,
            ProveedorNombre = r.OrdenCompra?.Proveedor?.RazonSocial ?? string.Empty
        }).ToList();

        traz.Recepciones = recepDtos;
        return traz;
    }

        public async Task<TrazabilidadDto> ObtenerTrazaLote(int loteId)
    {
        var traz = new TrazabilidadDto();
        var lote = await _loteRepo.GetByIdAsync(loteId);
        if (lote == null) return traz;

        traz.Lotes = new[] { new TrazabilidadDto.LoteResumenDto
        {
            Id = lote.Id,
                Codigo = lote.NumeroLote,
            ItemId = lote.ItemId,
            ItemNombre = lote.Item?.Nombre,
            CantidadRecibida = lote.CantidadRecibida,
            FechaVencimiento = lote.FechaVencimiento,
            RecepcionId = lote.RecepcionId
        }};

        // agregar recepcion asociada
        var r = lote.Recepcion;
            if (r != null)
        {
            traz.Recepciones = new[] { new TrazabilidadDto.RecepcionResumenDto
            {
                Id = r.Id,
                    Fecha = r.FechaRecepcion,
                OrdenCompraId = r.OrdenCompraId,
                OrdenCompraNumero = r.OrdenCompra?.NumeroOrden,
                FacturaId = r.FacturaId,
                FacturaNumero = r.Factura?.NumeroFactura,
                    ProveedorId = r.OrdenCompra?.ProveedorId ?? 0,
                    ProveedorNombre = r.OrdenCompra?.Proveedor?.RazonSocial
            }};
        }

        return traz;
    }

        public async Task<TrazabilidadDto> ObtenerTrazaFactura(int facturaId)
    {
        var traz = new TrazabilidadDto();
        var recepciones = await _recepcionRepo.ObtenerPorFacturaIdAsync(facturaId);

        traz.Recepciones = recepciones.Select(r => new TrazabilidadDto.RecepcionResumenDto
        {
            Id = r.Id,
                Fecha = r.FechaRecepcion,
            OrdenCompraId = r.OrdenCompraId,
            OrdenCompraNumero = r.OrdenCompra?.NumeroOrden,
            FacturaId = r.FacturaId,
            FacturaNumero = r.Factura?.NumeroFactura,
            ProveedorId = r.OrdenCompra?.ProveedorId ?? 0,
            ProveedorNombre = r.OrdenCompra?.Proveedor?.RazonSocial
        });

        return traz;
    }

        public async Task<IEnumerable<TrazabilidadDto.LoteResumenDto>> ObtenerVencimientosProximos(int diasAnticipacion)
    {
        var todos = await _loteRepo.GetTodosAsync();
        var umbral = DateTime.UtcNow.AddDays(diasAnticipacion);
        return todos.Where(l => l.FechaVencimiento <= umbral)
            .Select(l => new TrazabilidadDto.LoteResumenDto
            {
                Id = l.Id,
                Codigo = l.NumeroLote,
                ItemId = l.ItemId,
                ItemNombre = l.Item?.Nombre,
                CantidadRecibida = l.CantidadRecibida,
                FechaVencimiento = l.FechaVencimiento,
                RecepcionId = l.RecepcionId
            });
    }

    public async Task<IEnumerable<TrazabilidadDto.RecepcionResumenDto>> ObtenerRecepcionesPorProveedor(int proveedorId)
    {
        // KPI simple: devolver recepciones del proveedor
        var desde = DateTime.MinValue;
        var hasta = DateTime.MaxValue;
        var recepciones = await _recepcionRepo.ObtenerPorProveedorAsync(proveedorId, desde, hasta);
        return recepciones.Select(r => new TrazabilidadDto.RecepcionResumenDto
        {
            Id = r.Id,
            Fecha = r.FechaRecepcion,
            OrdenCompraId = r.OrdenCompraId,
            OrdenCompraNumero = r.OrdenCompra?.NumeroOrden,
            FacturaId = r.FacturaId,
            FacturaNumero = r.Factura?.NumeroFactura,
            ProveedorId = proveedorId,
            ProveedorNombre = r.OrdenCompra?.Proveedor?.RazonSocial
        });
    }
}
