using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using RecepcionMP.Application.DTOs;
using RecepcionMP.Application.Interfaces;
using RecepcionMP.Domain.Interfaces;
using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Application.Services
{
    public class AuditoriaService : IAuditoriaService
    {
        private readonly RecepcionMP.Application.Interfaces.Repositories.IAuditoriaRepository _repo;

        public AuditoriaService(RecepcionMP.Application.Interfaces.Repositories.IAuditoriaRepository repo)
        {
            _repo = repo;
        }

        public async Task RegistrarAsync(AuditoriaDto dto)
        {
            var entidad = new RegistroAuditoria
            {
                UsuarioId = dto.UsuarioId,
                NombreUsuario = dto.NombreUsuario,
                IP = dto.IP,
                FechaHora = dto.FechaHora == default ? DateTime.UtcNow : dto.FechaHora,
                Tabla = dto.Tabla,
                RegistroId = dto.RegistroId,
                Accion = (TipoAccion)dto.Accion,
                ValoresAntes = dto.ValoresAntes,
                ValoresDespues = dto.ValoresDespues,
                Descripcion = dto.Descripcion
            };
            await _repo.LogAsync(entidad);
        }

        public async Task<IEnumerable<AuditoriaDto>> ObtenerPorTablaAsync(string tabla, int registroId)
        {
            var list = await _repo.GetHistorialPorTablaAsync(tabla, registroId);
            return list.Select(r => new AuditoriaDto
            {
                UsuarioId = r.UsuarioId,
                NombreUsuario = r.NombreUsuario,
                IP = r.IP,
                FechaHora = r.FechaHora,
                Tabla = r.Tabla,
                RegistroId = r.RegistroId,
                Accion = (int)r.Accion,
                ValoresAntes = r.ValoresAntes,
                ValoresDespues = r.ValoresDespues,
                Descripcion = r.Descripcion
            });
        }

        public async Task<IEnumerable<AuditoriaDto>> ObtenerPorUsuarioAsync(string usuarioId, DateTime desde, DateTime hasta)
        {
            var list = await _repo.GetHistorialPorUsuarioAsync(usuarioId);
            return list.Where(r => r.FechaHora >= desde && r.FechaHora <= hasta)
                       .Select(r => new AuditoriaDto
                       {
                           UsuarioId = r.UsuarioId,
                           NombreUsuario = r.NombreUsuario,
                           IP = r.IP,
                           FechaHora = r.FechaHora,
                           Tabla = r.Tabla,
                           RegistroId = r.RegistroId,
                           Accion = (int)r.Accion,
                           ValoresAntes = r.ValoresAntes,
                           ValoresDespues = r.ValoresDespues,
                           Descripcion = r.Descripcion
                       });
        }
    }
}