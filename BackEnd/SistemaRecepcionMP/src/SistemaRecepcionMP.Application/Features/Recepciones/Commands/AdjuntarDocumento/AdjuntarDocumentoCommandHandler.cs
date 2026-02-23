using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Exceptions.Recepciones;
using SistemaRecepcionMP.Domain.Interfaces;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.AdjuntarDocumento;

public sealed class AdjuntarDocumentoCommandHandler : IRequestHandler<AdjuntarDocumentoCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFileStorageService _fileStorage;
    private readonly ICurrentUserService _currentUser;

    public AdjuntarDocumentoCommandHandler(
        IUnitOfWork unitOfWork,
        IFileStorageService fileStorage,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _fileStorage = fileStorage;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(
        AdjuntarDocumentoCommand request,
        CancellationToken cancellationToken)
    {
        // Verificar que la recepción o el lote existen
        if (request.RecepcionId.HasValue)
        {
            var recepcion = await _unitOfWork.Recepciones.GetByIdAsync(request.RecepcionId.Value)
                ?? throw new RecepcionNotFoundException(request.RecepcionId.Value);

            if (recepcion.Estado == Domain.Enums.EstadoRecepcion.Liberada ||
                recepcion.Estado == Domain.Enums.EstadoRecepcion.Rechazada)
                throw new RecepcionYaCerradaException(recepcion.NumeroRecepcion);
        }

        if (request.LoteRecibidoId.HasValue)
        {
            var lote = await _unitOfWork.Lotes.GetByIdAsync(request.LoteRecibidoId.Value)
                ?? throw new Domain.Exceptions.BusinessRuleException(
                    $"No se encontró el lote con ID '{request.LoteRecibidoId}'.");
        }

        // Subir archivo
        var carpeta = request.RecepcionId.HasValue ? "recepciones" : "lotes";
        var entidadId = (request.RecepcionId ?? request.LoteRecibidoId)!.Value;
        var nombreUnico = $"{carpeta}/{entidadId}/{request.TipoDocumento}/{Guid.NewGuid()}_{request.NombreArchivo}";

        var url = await _fileStorage.SubirArchivoAsync(
            request.ContenidoArchivo,
            nombreUnico,
            "documentos-recepcion",
            cancellationToken);

        var documento = new DocumentoRecepcion
        {
            RecepcionId = request.RecepcionId,
            LoteRecibidoId = request.LoteRecibidoId,
            TipoDocumento = request.TipoDocumento,
            NombreArchivo = request.NombreArchivo,
            AdjuntoUrl = url,
            FechaCarga = DateTime.UtcNow,
            CargadoPor = _currentUser.UserId,
            EsValido = null // pendiente de revisión por Calidad
        };

        // Agregar al padre correspondiente
        if (request.RecepcionId.HasValue)
        {
            var recepcion = await _unitOfWork.Recepciones.GetByIdAsync(request.RecepcionId.Value);
            recepcion!.Documentos.Add(documento);
            _unitOfWork.Recepciones.Update(recepcion);
        }
        else
        {
            var lote = await _unitOfWork.Lotes.GetByIdAsync(request.LoteRecibidoId!.Value);
            lote!.Documentos.Add(documento);
            _unitOfWork.Lotes.Update(lote);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return documento.Id;
    }
}