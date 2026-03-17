using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Exceptions.Proveedores;
using SistemaRecepcionMP.Domain.Interfaces;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Proveedores.Commands.AgregarDocumentoSanitario;

public sealed class AgregarDocumentoSanitarioCommandHandler
    : IRequestHandler<AgregarDocumentoSanitarioCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFileStorageService _fileStorage;

    public AgregarDocumentoSanitarioCommandHandler(
        IUnitOfWork unitOfWork,
        IFileStorageService fileStorage)
    {
        _unitOfWork = unitOfWork;
        _fileStorage = fileStorage;
    }

    public async Task<Guid> Handle(
    AgregarDocumentoSanitarioCommand request,
    CancellationToken cancellationToken)
    {

        var proveedor = await _unitOfWork.Proveedores.GetWithDocumentosSanitariosAsync(request.ProveedorId)
            ?? throw new ProveedorNotFoundException(request.ProveedorId);

        var nombreUnico = $"{request.ProveedorId}/{request.TipoDocumento}/{Guid.NewGuid()}_{request.NombreArchivo}";
        var urlAdjunto = await _fileStorage.SubirArchivoAsync(
            request.ContenidoArchivo,
            nombreUnico,
            "documentos-sanitarios",
            cancellationToken);

        var documento = new DocumentoSanitarioProveedor
        {
            ProveedorId = request.ProveedorId,
            TipoDocumento = request.TipoDocumento,
            NumeroDocumento = request.NumeroDocumento.Trim(),
            FechaExpedicion = request.FechaExpedicion,
            FechaVencimiento = request.FechaVencimiento,
            AdjuntoUrl = urlAdjunto
        };

        await _unitOfWork.Proveedores.AddDocumentoSanitarioAsync(documento);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return documento.Id;
    }
}