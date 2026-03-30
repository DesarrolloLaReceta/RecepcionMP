using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Application.Features.Proveedores;

public static class ProveedorCalculos
{
    public static int TotalRecepciones(Proveedor p)
        => p.OrdenesCompra?.SelectMany(oc => oc.Recepciones ?? new List<Recepcion>()).Count() ?? 0;

    public static double TasaAceptacion(Proveedor p)
    {
        // Obtener todos los lotes de las recepciones del proveedor
        var lotes = p.OrdenesCompra?
            .SelectMany(oc => oc.Recepciones ?? new List<Recepcion>())
            .SelectMany(r => r.Items.SelectMany(i => i.Lotes)) // ✅ Cambio clave
            .ToList() ?? new();

        if (lotes.Count == 0) return 0;

        // Contar lotes liberados (aceptados)
        var aceptados = lotes.Count(l => l.Estado == EstadoLote.Liberado); // ✅ Estado correcto

        return Math.Round((double)aceptados / lotes.Count * 100, 1);
    }

    public static List<string> Categorias(Proveedor p)
    {
        // Obtener categorías de los ítems de los lotes
        return p.OrdenesCompra?
            .SelectMany(oc => oc.Detalles)
            .Select(d => d.Item?.Categoria?.Nombre)
            .Where(n => n is not null)
            .Select(n => n!)
            .Distinct()
            .OrderBy(n => n)
            .ToList() ?? new();
    }
}