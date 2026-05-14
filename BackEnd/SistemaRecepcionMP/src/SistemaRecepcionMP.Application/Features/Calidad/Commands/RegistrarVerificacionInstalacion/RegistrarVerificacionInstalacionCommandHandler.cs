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
    private readonly ICalidadEvidenciaFileStorage _calidadFotos;
    private readonly ICurrentUserService _currentUserService;

    public RegistrarVerificacionInstalacionCommandHandler(
        IUnitOfWork unitOfWork,
        ICalidadEvidenciaFileStorage calidadFotos,
        ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _calidadFotos = calidadFotos;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(
        RegistrarVerificacionInstalacionCommand request,
        CancellationToken cancellationToken)
    {
        var cabecera = new VerificacionInstalacion(
            request.Zona.Trim(),
            request.FechaPeriodo,
            _currentUserService.UserId,
            request.CumplimientoTotal,
            request.NombreResponsable.Trim(),
            request.CargoResponsable.Trim());

        foreach (var detalleRequest in request.Detalles)
        {
            var nombresFotos = new List<string>();
            foreach (var foto in detalleRequest.Fotos)
            {
                if (foto.Contenido.Length == 0) continue;
                var ext = Path.GetExtension(foto.NombreArchivo);
                var guardado = await _calidadFotos.GuardarFotoAsync(
                    foto.Contenido,
                    string.IsNullOrEmpty(ext) ? ".bin" : ext,
                    cancellationToken);
                nombresFotos.Add(guardado);
            }

            var detalle = new VerificacionInstalacionDetalle(
                cabecera.Id,
                detalleRequest.AspectoId,
                detalleRequest.AspectoNombre,
                detalleRequest.Calificacion,
                detalleRequest.Hallazgo,
                detalleRequest.PlanAccion,
                detalleRequest.Responsable,
                nombresFotos.Count == 0 ? null : JsonSerializer.Serialize(nombresFotos));

            cabecera.AgregarDetalle(detalle);
        }

        await _unitOfWork.VerificacionesInstalaciones.AddAsync(cabecera);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return cabecera.Id;
    }
}

