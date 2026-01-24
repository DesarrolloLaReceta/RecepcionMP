
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using RecepcionMP.Application.DTOs.OrdenCompra;
using RecepcionMP.Application.Interfaces;
using RecepcionMP.Domain.Interfaces;
using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Application.Services
{
    public class OrdenCompraService : IOrdenCompraService
    {
        private readonly RecepcionMP.Application.Interfaces.Repositories.IOrdenCompraRepository _ordenRepo;
        private readonly RecepcionMP.Application.Interfaces.Repositories.IProveedorRepository _proveedorRepo;

        public OrdenCompraService(
            RecepcionMP.Application.Interfaces.Repositories.IOrdenCompraRepository ordenRepo,
            RecepcionMP.Application.Interfaces.Repositories.IProveedorRepository proveedorRepo)
        {
            _ordenRepo = ordenRepo;
            _proveedorRepo = proveedorRepo;
        }

    public async Task<int> CrearAsync(CreateOrdenCompraDto dto)
    {
        // Validación de negocio
        var existente = await _ordenRepo.GetByNumeroAsync(dto.NumeroOrden);
        if (existente != null)
            throw new Exception("La orden de compra ya existe");

        var orden = new OrdenCompra
        {
            NumeroOrden = dto.NumeroOrden,
            FechaOrden = dto.FechaOrden,
            ProveedorId = dto.ProveedorId,
            Estado = EstadoOrdenCompra.Abierta,
            Items = dto.Items.Select(i => new OrdenCompraItem
            {
                ItemId = i.ItemId,
                CantidadEsperada = i.CantidadEsperada,
                UnidadMedida = i.UnidadMedida
            }).ToList()
        };

        await _ordenRepo.AddAsync(orden);
        return orden.Id;
    }

    public async Task<List<ReadOrdenCompraDto>> ObtenerTodasAsync()
    {
        var ordenes = await _ordenRepo.GetAllAsync();

        return ordenes.Select(o => new ReadOrdenCompraDto
        {
            Id = o.Id,
            NumeroOrden = o.NumeroOrden,
            FechaOrden = o.FechaOrden,
            Proveedor = o.Proveedor.RazonSocial,
            Estado = o.Estado.ToString(),
            Items = o.Items.Select(i => new ReadOrdenCompraItemDto
            {
                Item = i.Item.Nombre,
                CantidadEsperada = i.CantidadEsperada,
                UnidadMedida = i.UnidadMedida
            }).ToList()
        }).ToList();
    }

    public async Task<ReadOrdenCompraDto?> ObtenerPorIdAsync(int id)
    {
        var o = await _ordenRepo.GetByIdAsync(id);
        if (o == null) return null;

        return new ReadOrdenCompraDto
        {
            Id = o.Id,
            NumeroOrden = o.NumeroOrden,
            FechaOrden = o.FechaOrden,
            Proveedor = o.Proveedor.RazonSocial,
            Estado = o.Estado.ToString(),
            Items = o.Items.Select(i => new ReadOrdenCompraItemDto
            {
                Item = i.Item.Nombre,
                CantidadEsperada = i.CantidadEsperada,
                UnidadMedida = i.UnidadMedida
            }).ToList()
        };
    }

        public Task GetAllAsync()
        {
            throw new NotImplementedException();
        }
    }
}
