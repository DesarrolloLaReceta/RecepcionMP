using SistemaRecepcionMP.Application.Common.Behaviours;
using MediatR;

namespace SistemaRecepcionMP.Application.Features.Items.Commands.CrearItem;

public sealed class CrearItemCommand : IRequest<Guid>, IAuditableCommand
{
    public string CodigoInterno { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public Guid CategoriaId { get; set; }
    public string UnidadMedida { get; set; } = string.Empty;
    public int VidaUtilDias { get; set; }
    // Rango de temperatura objetivo (opcional, solo para ítems que requieren cadena de frío)
    public decimal? TemperaturaMinima { get; set; }
    public decimal? TemperaturaMaxima { get; set; }
    public bool RequiereLoteProveedor { get; set; }

    // IAuditableCommand
    public string EntidadAfectada => "Item";
    public string RegistroId => CodigoInterno;
}