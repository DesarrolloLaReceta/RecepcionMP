using MediatR;
using System.Collections.Generic;

namespace SistemaRecepcionMP.Application.Features.Calidad.Commands.RegistrarLiberacionCocina
{
    // El DTO definido aquí mismo para evitar errores de referencia
    public class ItemInspeccionDto
    {
        public string Item { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
    }

    public class RegistrarLiberacionCocinaCommand : IRequest<int>
    {
        public string Turno { get; set; } = string.Empty;
        public string Cocina { get; set; } = string.Empty;
        public List<ItemInspeccionDto> Inspeccion { get; set; } = new();
        public string ObservacionesInspeccion { get; set; } = string.Empty;
        public string NombreResponsable { get; set; } = string.Empty;
        public string CargoResponsable { get; set; } = string.Empty;
        public string ObservacionesGenerales { get; set; } = string.Empty;
    }
}