using MediatR;
using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Interfaces;

namespace SistemaRecepcionMP.Application.Features.Calidad.Commands.RegistrarLavadoBotasManos;

public sealed class RegistrarLavadoBotasManosCommandHandler : IRequestHandler<RegistrarLavadoBotasManosCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICalidadEvidenciaFileStorage _calidadFotos;
    private readonly ICurrentUserService _currentUserService;

    public RegistrarLavadoBotasManosCommandHandler(
        IUnitOfWork unitOfWork,
        ICalidadEvidenciaFileStorage calidadFotos,
        ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _calidadFotos = calidadFotos;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(RegistrarLavadoBotasManosCommand request, CancellationToken cancellationToken)
    {
        string? nombreArchivoFoto = null;
        if (request.FotoContenido is { Length: > 0 })
        {
            var ext = Path.GetExtension(request.FotoNombreArchivo ?? string.Empty);
            nombreArchivoFoto = await _calidadFotos.GuardarFotoAsync(
                request.FotoContenido,
                string.IsNullOrEmpty(ext) ? ".bin" : ext,
                cancellationToken);
        }

        var entity = new LavadoBotasManos(
            request.Fecha,
            request.Turno.Trim(),
            request.Piso.Trim(),
            request.Entrada.Trim(),
            request.PersonasRevisadas,
            request.Novedades,
            request.Observaciones,
            nombreArchivoFoto,
            _currentUserService.UserId,
            request.NombreResponsable.Trim(), // Ahora sí está dentro del constructor
            request.CargoResponsable.Trim()    // Sin coma aquí porque es el último parámetro
        ); // <--- El paréntesis y el punto y coma van AQUÍ    

        await _unitOfWork.LavadosBotasManos.AddAsync(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}

