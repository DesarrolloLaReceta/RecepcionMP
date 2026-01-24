using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RecepcionMP.Application.DTOs;

namespace RecepcionMP.Application.Interfaces
{
    public interface IAuditoriaService
    {
        Task RegistrarAsync(AuditoriaDto dto);
        Task<IEnumerable<AuditoriaDto>> ObtenerPorTablaAsync(string tabla, int registroId);
        Task<IEnumerable<AuditoriaDto>> ObtenerPorUsuarioAsync(string usuarioId, DateTime desde, DateTime hasta);
    }
}