using SistemaRecepcionMP.Domain.ValueObjects;

namespace SistemaRecepcionMP.Domain.Entities;

public class CategoriaItem : BaseEntity
{
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public bool RequiereCadenaFrio { get; set; }
    public RangoTemperatura? RangoTemperatura { get; set; }
    public bool RequierePresenciaCalidad { get; set; }
    public int VidaUtilMinimaDias { get; set; }

    // Navegación
    public ICollection<Item> Items { get; set; } = new List<Item>();
    public ICollection<TipoDocumentoExigidoCategoria> DocumentosExigidos { get; set; } = new List<TipoDocumentoExigidoCategoria>();
    public ICollection<ChecklistBPM> Checklists { get; set; } = new List<ChecklistBPM>();
}