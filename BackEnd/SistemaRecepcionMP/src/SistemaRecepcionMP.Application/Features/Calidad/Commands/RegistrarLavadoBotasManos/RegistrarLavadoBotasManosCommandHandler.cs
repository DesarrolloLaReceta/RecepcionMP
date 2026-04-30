using MediatR;
using SistemaRecepcionMP.Application.Common.Interfaces;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Interfaces;

namespace SistemaRecepcionMP.Application.Features.Calidad.Commands.RegistrarLavadoBotasManos;

public sealed class RegistrarLavadoBotasManosCommandHandler : IRequestHandler<RegistrarLavadoBotasManosCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFileStorageService _fileStorageService;
    private readonly ICurrentUserService _currentUserService;

    public RegistrarLavadoBotasManosCommandHandler(
        IUnitOfWork unitOfWork,
        IFileStorageService fileStorageService,
        ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _fileStorageService = fileStorageService;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(RegistrarLavadoBotasManosCommand request, CancellationToken cancellationToken)
    {
        string? rutaFoto = null;
        if (request.FotoContenido is { Length: > 0 } && !string.IsNullOrWhiteSpace(request.FotoNombreArchivo))
        {
            var nombre = $"lavado-botas-manos/{DateTime.UtcNow:yyyyMMdd}/{Guid.NewGuid()}_{request.FotoNombreArchivo}";
            rutaFoto = await _fileStorageService.SubirArchivoAsync(
                request.FotoContenido,
                nombre,
                "documentos-recepcion",
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
            rutaFoto,
            _currentUserService.UserId,
            request.NombreResponsable.Trim(), // Ahora sí está dentro del constructor
            request.CargoResponsable.Trim()    // Sin coma aquí porque es el último parámetro
        ); // <--- El paréntesis y el punto y coma van AQUÍ    

        await _unitOfWork.LavadosBotasManos.AddAsync(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}

