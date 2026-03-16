using MediatR;
using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Domain.Interfaces;

namespace SistemaRecepcionMP.Application.Features.Proveedores.Commands.EliminarDocumentoSanitario;

public record EliminarDocumentoSanitarioCommand(Guid ProveedorId, Guid DocumentoId) : IRequest;

public class EliminarDocumentoSanitarioCommandHandler : IRequestHandler<EliminarDocumentoSanitarioCommand>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFileStorageService _fileStorage;

    public EliminarDocumentoSanitarioCommandHandler(
        IUnitOfWork unitOfWork,
        IFileStorageService fileStorage)
    {
        _unitOfWork = unitOfWork;
        _fileStorage = fileStorage;
    }

    public async Task Handle(EliminarDocumentoSanitarioCommand request, CancellationToken cancellationToken)
    {
        var proveedor = await _unitOfWork.Proveedores
            .GetWithDocumentosSanitariosAsync(request.ProveedorId)
            ?? throw new KeyNotFoundException($"Proveedor {request.ProveedorId} no encontrado.");

        var documento = proveedor.DocumentosSanitarios
            .FirstOrDefault(d => d.Id == request.DocumentoId)
            ?? throw new KeyNotFoundException($"Documento {request.DocumentoId} no encontrado.");

        if (!string.IsNullOrEmpty(documento.AdjuntoUrl))
            await _fileStorage.EliminarArchivoAsync(documento.AdjuntoUrl, cancellationToken);

        proveedor.DocumentosSanitarios.Remove(documento);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}