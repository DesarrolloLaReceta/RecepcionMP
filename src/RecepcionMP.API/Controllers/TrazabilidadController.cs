using Microsoft.AspNetCore.Mvc;
using RecepcionMP.Application.Interfaces;
using RecepcionMP.Application.DTOs;

namespace RecepcionMP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TrazabilidadController : ControllerBase
    {
        private readonly ITrazabilidadService _trazabilidadService;

        public TrazabilidadController(ITrazabilidadService trazabilidadService)
        {
            _trazabilidadService = trazabilidadService;
        }

        [HttpGet("proveedor/{proveedorId}")]
        public async Task<ActionResult<TrazabilidadDto>> ObtenerTrazaProveedor(int proveedorId, [FromQuery] DateTime desde, [FromQuery] DateTime hasta)
        {
            var result = await _trazabilidadService.ObtenerTrazaProveedor(proveedorId, desde, hasta);
            return Ok(result);
        }

        [HttpGet("lote/{loteId}")]
        public async Task<ActionResult<TrazabilidadDto>> ObtenerTrazaLote(int loteId)
        {
            var result = await _trazabilidadService.ObtenerTrazaLote(loteId);
            return Ok(result);
        }

        [HttpGet("factura/{facturaId}")]
        public async Task<ActionResult<TrazabilidadDto>> ObtenerTrazaFactura(int facturaId)
        {
            var result = await _trazabilidadService.ObtenerTrazaFactura(facturaId);
            return Ok(result);
        }

        [HttpGet("vencimientos")]
        public async Task<ActionResult<IEnumerable<TrazabilidadDto.LoteResumenDto>>> ObtenerVencimientosProximos([FromQuery] int diasAnticipacion)
        {
            var result = await _trazabilidadService.ObtenerVencimientosProximos(diasAnticipacion);
            return Ok(result);
        }

        [HttpGet("recepciones/proveedor/{proveedorId}")]
        public async Task<ActionResult<IEnumerable<TrazabilidadDto.RecepcionResumenDto>>> ObtenerRecepcionesPorProveedor(int proveedorId)
        {
            var result = await _trazabilidadService.ObtenerRecepcionesPorProveedor(proveedorId);
            return Ok(result);
        }
    }
}
