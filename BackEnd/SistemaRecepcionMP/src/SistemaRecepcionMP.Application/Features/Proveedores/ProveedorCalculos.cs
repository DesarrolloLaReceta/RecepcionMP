using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Application.Features.Proveedores;

public static class ProveedorCalculos
{
    public static int TotalRecepciones(Proveedor p)
        => p.OrdenesCompra?.SelectMany(oc => oc.Recepciones ?? new List<Recepcion>()).Count() ?? 0;

    public static double TasaAceptacion(Proveedor p)
    {
        var lotes = p.OrdenesCompra?
            .SelectMany(oc => oc.Recepciones ?? new List<Recepcion>())
            .SelectMany(r => r.Lotes ?? new List<LoteRecibido>())
            .ToList() ?? new();

        if (lotes.Count == 0) return 0;

        var aceptados = lotes.Count(l =>
            l.Estado == EstadoLote.Liberado);

        return Math.Round((double)aceptados / lotes.Count * 100, 1);
    }

    public static List<string> Categorias(Proveedor p)
    => p.OrdenesCompra?
        .SelectMany(oc => oc.Detalles)
        .Select(d => d.Item?.Categoria?.Nombre)
        .Where(n => n is not null)
        .Select(n => n!)
        .Distinct()
        .OrderBy(n => n)
        .ToList() ?? new();
}