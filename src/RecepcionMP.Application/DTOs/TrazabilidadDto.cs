using System.Collections.Generic;

namespace RecepcionMP.Application.DTOs
{
    public class TrazabilidadDto
    {
        public IEnumerable<RecepcionResumenDto> Recepciones { get; set; } = new List<RecepcionResumenDto>();
        public IEnumerable<LoteResumenDto> Lotes { get; set; } = new List<LoteResumenDto>();
        public IEnumerable<OrdenCompraResumenDto> OrdenesCompra { get; set; } = new List<OrdenCompraResumenDto>();
        public IEnumerable<FacturaResumenDto> Facturas { get; set; } = new List<FacturaResumenDto>();

        public class RecepcionResumenDto
        {
            public int Id { get; set; }
            public DateTime Fecha { get; set; }
            public int? OrdenCompraId { get; set; }
            public string? OrdenCompraNumero { get; set; }
            public int? FacturaId { get; set; }
            public string? FacturaNumero { get; set; }
            public int ProveedorId { get; set; }
            public string? ProveedorNombre { get; set; }
        }

        public class LoteResumenDto
        {
            public int Id { get; set; }
            public string? Codigo { get; set; }
            public int ItemId { get; set; }
            public string? ItemNombre { get; set; }
            public decimal CantidadRecibida { get; set; }
            public DateTime? FechaVencimiento { get; set; }
            public int RecepcionId { get; set; }
        }

        public class OrdenCompraResumenDto
        {
            public int Id { get; set; }
            public string? Numero { get; set; }
            public DateTime Fecha { get; set; }
        }

        public class FacturaResumenDto
        {
            public int Id { get; set; }
            public string? Numero { get; set; }
            public DateTime Fecha { get; set; }
        }
    }
}
