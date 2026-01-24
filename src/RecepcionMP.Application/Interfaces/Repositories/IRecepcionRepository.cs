using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Application.Interfaces.Repositories;

public interface IRecepcionRepository
{
    Task AddAsync(Recepcion recepcion);
    Task<Recepcion?> ObtenerPorIdAsync(int id);
    Task<IEnumerable<Recepcion>> ObtenerPorProveedorAsync(int proveedorId, DateTime desde, DateTime hasta);
    Task<IEnumerable<Recepcion>> ObtenerPorFacturaIdAsync(int facturaId);
    Task<decimal> ObtenerCantidadRecibidaAsync(int ordenCompraId,int itemId);

    Task<IEnumerable<Recepcion>> ObtenerTodosAsync();

}
