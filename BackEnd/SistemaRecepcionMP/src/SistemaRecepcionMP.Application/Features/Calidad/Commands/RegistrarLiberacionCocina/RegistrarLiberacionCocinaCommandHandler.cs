using MediatR;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Interfaces; // Aquí vive IUnitOfWork
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SistemaRecepcionMP.Application.Features.Calidad.Commands.RegistrarLiberacionCocina
{
    public class RegistrarLiberacionCocinaCommandHandler : IRequestHandler<RegistrarLiberacionCocinaCommand, int>
    {
        private readonly IUnitOfWork _unitOfWork;

        public RegistrarLiberacionCocinaCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<int> Handle(RegistrarLiberacionCocinaCommand request, CancellationToken cancellationToken)
        {
            var entidad = new LiberacionCocina
            {   
                Fecha = request.Fecha,
                Turno = request.Turno.Trim(),
                Cocina = request.Cocina.Trim(),
                ObservacionesInspeccion = request.ObservacionesInspeccion,
                NombreResponsable = request.NombreResponsable,
                CargoResponsable = request.CargoResponsable,
                ObservacionesGenerales = request.ObservacionesGenerales,
                Detalles = request.Inspeccion.Select(x => new DetalleInspeccionCocina
                {
                    Item = x.Item,
                    Estado = x.Estado
                }).ToList()
            };

            // Usamos _unitOfWork en lugar de _context
            await _unitOfWork.LiberacionesCocinas.AddAsync(entidad);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return entidad.Id;
        }
    }
}