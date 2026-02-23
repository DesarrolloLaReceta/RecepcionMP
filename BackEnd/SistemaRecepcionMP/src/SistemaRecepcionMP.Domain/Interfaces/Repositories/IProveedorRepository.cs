using SistemaRecepcionMP.Domain.Entities;

namespace SistemaRecepcionMP.Domain.Interfaces.Repositories;

public interface IProveedorRepository : IRepository<Proveedor>
{
    Task<Proveedor?> GetByNitAsync(string nit);
    Task<Proveedor?> GetWithDocumentosSanitariosAsync(Guid id);
    Task<IEnumerable<DocumentoSanitarioProveedor>> GetDocumentosProximosAVencerAsync(int diasUmbral);
}