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
        // Verificar que el proveedor existe
        var proveedor = await _unitOfWork.Proveedores.GetByIdAsync(request.ProveedorId)
            ?? throw new ProveedorNotFoundException(request.ProveedorId);

        // Subir el archivo al almacenamiento
        var nombreUnico = $"{request.ProveedorId}/{request.TipoDocumento}/{Guid.NewGuid()}_{request.NombreArchivo}";
        var urlAdjunto = await _fileStorage.SubirArchivoAsync(
            request.ContenidoArchivo,
            nombreUnico,
            "documentos-sanitarios",
            cancellationToken);

        var documento = new DocumentoSanitarioProveedor
        {
            ProveedorId = proveedor.Id,
            TipoDocumento = request.TipoDocumento,
            NumeroDocumento = request.NumeroDocumento.Trim(),
            FechaExpedicion = request.FechaExpedicion,
            FechaVencimiento = request.FechaVencimiento,
            AdjuntoUrl = urlAdjunto
        };

        // Se agrega a la colección del proveedor — EF Core lo inserta automáticamente
        proveedor.DocumentosSanitarios.Add(documento);
        _unitOfWork.Proveedores.Update(proveedor);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return documento.Id;
    }
}