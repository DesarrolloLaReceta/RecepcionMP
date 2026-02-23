using SistemaRecepcionMP.Application.Common.Behaviours;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Items.Commands.ActualizarItem;

public sealed class ActualizarItemCommand : IRequest, IAuditableCommand
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string UnidadMedida { get; set; } = string.Empty;
    public int VidaUtilDias { get; set; }
    // Rango de temperatura objetivo (opcional, solo para ítems que requieren cadena de frío)
    public decimal? TemperaturaMinima { get; set; }
    public decimal? TemperaturaMaxima { get; set; }
    public bool RequiereLoteProveedor { get; set; }
    public bool Estado { get; set; }

    // IAuditableCommand
    public string EntidadAfectada => "Item";
    public string RegistroId => Id.ToString();
}