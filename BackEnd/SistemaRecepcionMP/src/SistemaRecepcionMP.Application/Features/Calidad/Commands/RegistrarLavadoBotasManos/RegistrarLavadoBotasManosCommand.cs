using MediatR;
using SistemaRecepcionMP.Application.Common.Behaviours;

namespace SistemaRecepcionMP.Application.Features.Calidad.Commands.RegistrarLavadoBotasManos;

public sealed class RegistrarLavadoBotasManosCommand : IRequest<Guid>, IAuditableCommand
{
    public DateTime Fecha { get; set; }
    public string Turno { get; set; } = string.Empty;
    public string Piso { get; set; } = string.Empty;
    public string Entrada { get; set; } = string.Empty;
    public int PersonasRevisadas { get; set; }
    public string? Novedades { get; set; }
    public string? Observaciones { get; set; }
    public string? FotoNombreArchivo { get; set; }
    public byte[]? FotoContenido { get; set; }

    public string EntidadAfectada => "LavadoBotasManos";
    public string RegistroId => Turno;
}

