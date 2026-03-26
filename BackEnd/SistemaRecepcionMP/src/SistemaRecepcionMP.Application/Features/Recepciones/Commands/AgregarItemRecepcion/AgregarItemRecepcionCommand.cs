using MediatR;
using SistemaRecepcionMP.Application.Common.Behaviours;


namespace SistemaRecepcionMP.Application.Features.Recepciones.Commands.AgregarItemRecepcion;

public sealed class AgregarItemRecepcionCommand : IRequest<Unit>, IAuditableCommand
{
    public Guid RecepcionId { get; set; }
    public Guid DetalleOrdenCompraId { get; set; }

    public string EntidadAfectada => "RecepcionItem";
    public string RegistroId => RecepcionId.ToString();
}