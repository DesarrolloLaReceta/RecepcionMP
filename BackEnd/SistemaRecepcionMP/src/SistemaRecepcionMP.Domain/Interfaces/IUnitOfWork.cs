using SistemaRecepcionMP.Domain.Interfaces.Repositories;

namespace SistemaRecepcionMP.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IProveedorRepository Proveedores { get; }
    IOrdenCompraRepository OrdenesCompra { get; }
    IRecepcionRepository Recepciones { get; }
    ILoteRecibidoRepository Lotes { get; }
    IItemRepository Items { get; }
    ICheckListBPMRepository Checklists { get; }
    INoConformidadRepository NoConformidades { get; }
    IUsuarioRepository Usuarios { get; }
    ITemperaturaRegistroRepository Temperaturas { get; }
    IBitacoraAuditoriaRepository Bitacora { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}