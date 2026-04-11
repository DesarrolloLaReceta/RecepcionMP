using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;
using SistemaRecepcionMP.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace SistemaRecepcionMP.Infraestructure.Persistence;

public static class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext db)
    {
        // ── Usuario dev ──────────────────────────────────────────────────────
        var devUserId = Guid.Parse("a0000000-0000-0000-0000-000000000001");

        if (!await db.Usuarios.AnyAsync(u => u.Id == devUserId))
        {
            db.Usuarios.Add(new Usuario
            {
                Id       = devUserId,
                Nombre   = "Dev User",
                Email    = "dev@empresa.com",
                Username  = "userdev",
                Perfil   = PerfilUsuario.Administrador,
                Activo   = true,
                CreadoEn = DateTime.UtcNow,
            });
            await db.SaveChangesAsync();
        }
        else
        {
            // Asegurar que devUserId apunta al usuario real en BD
            devUserId = (await db.Usuarios.FirstAsync()).Id;
        }

        // ── Categorías ───────────────────────────────────────────────────────
        if (!await db.CategoriasItem.AnyAsync())
        {
            var categorias = new List<CategoriaItem>
            {
                new() { Id = Guid.Parse("a1000000-0000-0000-0000-000000000001"),
                    Nombre = "Cárnicos", Descripcion = "Carnes frescas y procesadas",
                    RequiereCadenaFrio = true, RequierePresenciaCalidad = true,
                    VidaUtilMinimaDias = 3,
                    RangoTemperatura = new RangoTemperatura(0, 4) },
                new() { Id = Guid.Parse("a1000000-0000-0000-0000-000000000002"),
                    Nombre = "Lácteos", Descripcion = "Leche y derivados",
                    RequiereCadenaFrio = true, RequierePresenciaCalidad = true,
                    VidaUtilMinimaDias = 5,
                    RangoTemperatura = new RangoTemperatura(2, 8) },
                new() { Id = Guid.Parse("a1000000-0000-0000-0000-000000000003"),
                    Nombre = "Secos", Descripcion = "Harinas, azúcares, cereales",
                    RequiereCadenaFrio = false, RequierePresenciaCalidad = false,
                    VidaUtilMinimaDias = 30 },
                new() { Id = Guid.Parse("a1000000-0000-0000-0000-000000000004"),
                    Nombre = "Frutas/Verduras", Descripcion = "Productos frescos de origen vegetal",
                    RequiereCadenaFrio = false, RequierePresenciaCalidad = false,
                    VidaUtilMinimaDias = 2 },
                new() { Id = Guid.Parse("a1000000-0000-0000-0000-000000000005"),
                    Nombre = "Congelados", Descripcion = "Productos a temperatura negativa",
                    RequiereCadenaFrio = true, RequierePresenciaCalidad = true,
                    VidaUtilMinimaDias = 30,
                    RangoTemperatura = new RangoTemperatura(-18, -12) },
            };
            db.CategoriasItem.AddRange(categorias);
            await db.SaveChangesAsync();
        }

        // ── Ítems ────────────────────────────────────────────────────────────
        if (!await db.Items.AnyAsync())
        {
            var items = new List<Item>
            {
                new() { Id = Guid.Parse("b1000000-0000-0000-0000-000000000001"),
                    CodigoInterno = "CAR-001", Nombre = "Pechuga de pollo",
                    CategoriaId = Guid.Parse("a1000000-0000-0000-0000-000000000001"),
                    UnidadMedida = "Kg", VidaUtilDias = 5,
                    RangoTemperatura = new RangoTemperatura(0, 4), Estado = true },
                new() { Id = Guid.Parse("b1000000-0000-0000-0000-000000000002"),
                    CodigoInterno = "CAR-002", Nombre = "Muslo de pollo",
                    CategoriaId = Guid.Parse("a1000000-0000-0000-0000-000000000001"),
                    UnidadMedida = "Kg", VidaUtilDias = 5,
                    RangoTemperatura = new RangoTemperatura(0, 4), Estado = true },
                new() { Id = Guid.Parse("b1000000-0000-0000-0000-000000000003"),
                    CodigoInterno = "LAC-001", Nombre = "Leche entera UHT",
                    CategoriaId = Guid.Parse("a1000000-0000-0000-0000-000000000002"),
                    UnidadMedida = "L", VidaUtilDias = 180,
                    RangoTemperatura = new RangoTemperatura(2, 8), Estado = true },
                new() { Id = Guid.Parse("b1000000-0000-0000-0000-000000000004"),
                    CodigoInterno = "LAC-002", Nombre = "Queso doble crema",
                    CategoriaId = Guid.Parse("a1000000-0000-0000-0000-000000000002"),
                    UnidadMedida = "Kg", VidaUtilDias = 30,
                    RangoTemperatura = new RangoTemperatura(2, 8), Estado = true },
                new() { Id = Guid.Parse("b1000000-0000-0000-0000-000000000005"),
                    CodigoInterno = "LAC-003", Nombre = "Yogur natural",
                    CategoriaId = Guid.Parse("a1000000-0000-0000-0000-000000000002"),
                    UnidadMedida = "Kg", VidaUtilDias = 21,
                    RangoTemperatura = new RangoTemperatura(2, 8), Estado = true },
                new() { Id = Guid.Parse("b1000000-0000-0000-0000-000000000006"),
                    CodigoInterno = "SEC-001", Nombre = "Azúcar refinada",
                    CategoriaId = Guid.Parse("a1000000-0000-0000-0000-000000000003"),
                    UnidadMedida = "Kg", VidaUtilDias = 730, Estado = true },
                new() { Id = Guid.Parse("b1000000-0000-0000-0000-000000000007"),
                    CodigoInterno = "SEC-002", Nombre = "Azúcar morena",
                    CategoriaId = Guid.Parse("a1000000-0000-0000-0000-000000000003"),
                    UnidadMedida = "Kg", VidaUtilDias = 730, Estado = true },
                new() { Id = Guid.Parse("b1000000-0000-0000-0000-000000000008"),
                    CodigoInterno = "SEC-003", Nombre = "Harina de trigo",
                    CategoriaId = Guid.Parse("a1000000-0000-0000-0000-000000000003"),
                    UnidadMedida = "Kg", VidaUtilDias = 365, Estado = true },
            };
            db.Items.AddRange(items);
            await db.SaveChangesAsync();
        }

        // ── Proveedores ──────────────────────────────────────────────────────
        if (!await db.Proveedores.AnyAsync())
        {
            var proveedores = new List<Proveedor>
            {
                new() { Id = Guid.Parse("c1000000-0000-0000-0000-000000000001"),
                    RazonSocial = "AviCol S.A.", Nit = "800123456-7",
                    Telefono = "+57 601 234 5678", EmailContacto = "recepcion@avicol.com.co",
                    Direccion = "Cra 68 #13-42, Zona Industrial, Bogotá",
                    Estado = EstadoProveedor.Activo, CreadoEn = DateTime.UtcNow },
                new() { Id = Guid.Parse("c1000000-0000-0000-0000-000000000002"),
                    RazonSocial = "Lácteos del Valle", Nit = "900234567-8",
                    Telefono = "+57 602 345 6789", EmailContacto = "ventas@lacteosv.com",
                    Direccion = "Av. 3N #45-20, Cali",
                    Estado = EstadoProveedor.Activo, CreadoEn = DateTime.UtcNow },
                new() { Id = Guid.Parse("c1000000-0000-0000-0000-000000000003"),
                    RazonSocial = "Riopaila Castilla", Nit = "860000491-3",
                    Telefono = "+57 604 456 7890",
                    Direccion = "Km 12 vía Buga, Palmira",
                    Estado = EstadoProveedor.Activo, CreadoEn = DateTime.UtcNow },
                new() { Id = Guid.Parse("c1000000-0000-0000-0000-000000000004"),
                    RazonSocial = "Harinas del Meta S.A.", Nit = "901234567-2",
                    Telefono = "+57 608 567 8901",
                    Direccion = "Cll 15 #22-10, Villavicencio",
                    Estado = EstadoProveedor.Activo, CreadoEn = DateTime.UtcNow },
                new() { Id = Guid.Parse("c1000000-0000-0000-0000-000000000005"),
                    RazonSocial = "Alimentos Deli Ltda.", Nit = "800987654-3",
                    Telefono = "+57 604 678 9012",
                    Direccion = "Cra 50 #30-15, Medellín",
                    Estado = EstadoProveedor.Suspendido, CreadoEn = DateTime.UtcNow },
            };
            db.Proveedores.AddRange(proveedores);
            await db.SaveChangesAsync();
        }

        // ── Causales NC ──────────────────────────────────────────────────────
        if (!await db.CausalesNoConformidad.AnyAsync())
        {
            var causales = new List<CausalNoConformidad>
            {
                new() { Id = Guid.Parse("d1000000-0000-0000-0000-000000000001"),
                    Nombre = "Temperatura fuera de rango",
                    Descripcion = "La temperatura de recepción no cumple el rango exigido",
                    TipoAccionSugerida = TipoAccionCorrectiva.Cuarentena, Activo = true },
                new() { Id = Guid.Parse("d1000000-0000-0000-0000-000000000002"),
                    Nombre = "Empaque deteriorado",
                    Descripcion = "El empaque presenta roturas, humedad o signos de contaminación",
                    TipoAccionSugerida = TipoAccionCorrectiva.Devolucion, Activo = true },
                new() { Id = Guid.Parse("d1000000-0000-0000-0000-000000000003"),
                    Nombre = "Fecha de vencimiento insuficiente",
                    Descripcion = "La vida útil restante no cumple el mínimo exigido",
                    TipoAccionSugerida = TipoAccionCorrectiva.Devolucion, Activo = true },
                new() { Id = Guid.Parse("d1000000-0000-0000-0000-000000000004"),
                    Nombre = "Documentación incompleta",
                    Descripcion = "Faltan documentos obligatorios al momento de la recepción",
                    TipoAccionSugerida = TipoAccionCorrectiva.Cuarentena, Activo = true },
                new() { Id = Guid.Parse("d1000000-0000-0000-0000-000000000005"),
                    Nombre = "Cantidad incorrecta",
                    Descripcion = "La cantidad recibida no corresponde a la orden de compra",
                    TipoAccionSugerida = TipoAccionCorrectiva.Devolucion, Activo = true },
                new() { Id = Guid.Parse("d1000000-0000-0000-0000-000000000006"),
                    Nombre = "Calidad sensorial no conforme",
                    Descripcion = "El producto presenta características sensoriales inaceptables",
                    TipoAccionSugerida = TipoAccionCorrectiva.Devolucion, Activo = true },
            };
            db.CausalesNoConformidad.AddRange(causales);
            await db.SaveChangesAsync();
        }

        // ── OC de prueba ─────────────────────────────────────────────────────────
        if (!await db.OrdenesCompra.AnyAsync())
        {
            var ocId = Guid.Parse("e1000000-0000-0000-0000-000000000001");

            // 1. Insertar OC sin detalles
            var oc = new OrdenCompra
            {
                Id                   = ocId,
                NumeroOC             = "OC-2026-0001",
                ProveedorId          = Guid.Parse("c1000000-0000-0000-0000-000000000001"),
                FechaEmision         = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-5)),
                FechaEntregaEsperada = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2)),
                Estado               = EstadoOrdenCompra.Abierta,
                CreadoPor            = devUserId,
                CreadoEn             = DateTime.UtcNow,
            };
            db.OrdenesCompra.Add(oc);
            await db.SaveChangesAsync();

            // 2. Insertar detalles por separado
            db.DetallesOrdenCompra.AddRange(
                new DetalleOrdenCompra
                {
                    OrdenCompraId      = ocId,
                    ItemId             = Guid.Parse("b1000000-0000-0000-0000-000000000001"),
                    CantidadSolicitada = 500,
                    UnidadMedida       = "Kg",
                    PrecioUnitario     = 12800,
                },
                new DetalleOrdenCompra
                {
                    OrdenCompraId      = ocId,
                    ItemId             = Guid.Parse("b1000000-0000-0000-0000-000000000002"),
                    CantidadSolicitada = 300,
                    UnidadMedida       = "Kg",
                    PrecioUnitario     = 8500,
                }
            );
            await db.SaveChangesAsync();
        }
    }
}