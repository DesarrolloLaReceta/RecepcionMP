using RecepcionMP.Application.DTOs;

namespace RecepcionMP.Application.Interfaces;

public interface ITrazabilidadService
{
    Task<TrazabilidadDto> ObtenerTrazaProveedor(int proveedorId, DateTime desde, DateTime hasta);
    Task<TrazabilidadDto> ObtenerTrazaLote(int loteId);
    Task<TrazabilidadDto> ObtenerTrazaFactura(int facturaId);
    Task<IEnumerable<TrazabilidadDto.LoteResumenDto>> ObtenerVencimientosProximos(int diasAnticipacion);
    Task<IEnumerable<TrazabilidadDto.RecepcionResumenDto>> ObtenerRecepcionesPorProveedor(int proveedorId);
}
