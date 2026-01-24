using RecepcionMP.Domain.Entities;
using RecepcionMP.Application.DTOs.Proveedor;

namespace RecepcionMP.Application.Mappers
{
    public static class ProveedorMapper
    {
        public static ProveedorDto ToDto(this Proveedor p)
        {
            return new ProveedorDto
            {
                Id = p.Id,
                RazonSocial = p.RazonSocial,
                NIT = p.NIT,
                Contacto = p.Contacto,
                // Note: DTO intentionally contains a reduced set of fields.
                // Do not map domain-only properties here.
            };
        }

        public static Proveedor ToEntity(this CreateProveedorDto dto)
        {
            return new Proveedor
            {
                RazonSocial = dto.RazonSocial,
                NIT = dto.NIT,
                Contacto = dto.Contacto
            };
        }

        public static void UpdateEntity(this Proveedor proveedor, UpdateProveedorDto dto)
        {
            proveedor.RazonSocial = dto.RazonSocial;
            proveedor.Contacto = dto.Contacto;
            proveedor.Email = dto.Email;
            proveedor.Telefono = dto.Telefono;
            proveedor.Activo = dto.Activo;
        }
    }
}
