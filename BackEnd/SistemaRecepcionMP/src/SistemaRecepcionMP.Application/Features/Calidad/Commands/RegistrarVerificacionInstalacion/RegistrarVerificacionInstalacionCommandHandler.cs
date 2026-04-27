using MediatR;
using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Interfaces;
using System.Text.Json;

namespace SistemaRecepcionMP.Application.Features.Calidad.Commands.RegistrarVerificacionInstalacion;

public sealed class RegistrarVerificacionInstalacionCommandHandler
    : IRequestHandler<RegistrarVerificacionInstalacionCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFileStorageService _fileStorageService;
    private readonly ICurrentUserService _currentUserService;

    public RegistrarVerificacionInstalacionCommandHandler(
        IUnitOfWork unitOfWork,
        IFileStorageService fileStorageService,
        ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _fileStorageService = fileStorageService;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(
        RegistrarVerificacionInstalacionCommand request,
        CancellationToken cancellationToken)
    {
        var cabecera = new VerificacionInstalacion(
            request.Zona.Trim(),
            DateTime.UtcNow,
            _currentUserService.UserId,
            request.CumplimientoTotal);

        foreach (var detalleRequest in request.Detalles)
        {
            var rutasFotos = new List<string>();
            foreach (var foto in detalleRequest.Fotos)
            {
                if (foto.Contenido.Length == 0) continue;
                var nombre = $"verificaciones-instalaciones/{cabecera.Id}/{detalleRequest.AspectoId}/{Guid.NewGuid()}_{foto.NombreArchivo}";
                var ruta = await _fileStorageService.SubirArchivoAsync(
                    foto.Contenido,
                    nombre,
                    "documentos-recepcion",
                    cancellationToken);
                rutasFotos.Add(ruta);
            }

            var detalle = new VerificacionInstalacionDetalle(
                cabecera.Id,
                detalleRequest.AspectoId,
                detalleRequest.AspectoNombre,
                detalleRequest.Calificacion,
                detalleRequest.Hallazgo,
                detalleRequest.PlanAccion,
                detalleRequest.Responsable,
                rutasFotos.Count == 0 ? null : JsonSerializer.Serialize(rutasFotos));

            cabecera.AgregarDetalle(detalle);
        }

        await _unitOfWork.VerificacionesInstalaciones.AddAsync(cabecera);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return cabecera.Id;
    }
}

