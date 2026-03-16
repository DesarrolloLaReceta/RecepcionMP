using SistemaRecepcionMP.Domain.Entities;

namespace SistemaRecepcionMP.Domain.Interfaces.Repositories;

public interface IProveedorRepository : IRepository<Proveedor>
{
    Task<Proveedor?> GetByNitAsync(string nit);
    Task<Proveedor?> GetWithDocumentosSanitariosAsync(Guid proveedorId);
    Task<IEnumerable<Proveedor>> GetActivosAsync();
    Task<IEnumerable<DocumentoSanitarioProveedor>> GetDocumentosProximosAVencerAsync(int diasUmbral);
    Task AddDocumentoSanitarioAsync(DocumentoSanitarioProveedor documento);
}