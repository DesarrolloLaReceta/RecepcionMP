using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace SistemaRecepcionMP.Infraestructure.Persistence;

public sealed class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    // ── Maestros ─────────────────────────────────────────────────────────────
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<CategoriaItem> CategoriasItem => Set<CategoriaItem>();
    public DbSet<CausalNoConformidad> CausalesNoConformidad => Set<CausalNoConformidad>();
    public DbSet<TipoDocumentoExigidoCategoria> TiposDocumentoExigidoCategoria => Set<TipoDocumentoExigidoCategoria>();

    // ── Proveedores ───────────────────────────────────────────────────────────
    public DbSet<Proveedor> Proveedores => Set<Proveedor>();
    public DbSet<ContactoProveedor> ContactosProveedor => Set<ContactoProveedor>();
    public DbSet<DocumentoSanitarioProveedor> DocumentosSanitariosProveedor => Set<DocumentoSanitarioProveedor>();

    // ── Items ─────────────────────────────────────────────────────────────────
    public DbSet<Item> Items => Set<Item>();

    // ── Órdenes de Compra ─────────────────────────────────────────────────────
    public DbSet<OrdenCompra> OrdenesCompra => Set<OrdenCompra>();
    public DbSet<DetalleOrdenCompra> DetallesOrdenCompra => Set<DetalleOrdenCompra>();

    // ── Recepciones ───────────────────────────────────────────────────────────
    public DbSet<Recepcion> Recepciones => Set<Recepcion>();
    public DbSet<Factura> Facturas => Set<Factura>();
    public DbSet<InspeccionVehiculo> InspeccionesVehiculo => Set<InspeccionVehiculo>();
    public DbSet<LoteRecibido> LotesRecibidos => Set<LoteRecibido>();
    public DbSet<LiberacionLote> LiberacionesLote => Set<LiberacionLote>();
    public DbSet<Cuarentena> Cuarentenas => Set<Cuarentena>();
    public DbSet<DocumentoRecepcion> DocumentosRecepcion => Set<DocumentoRecepcion>();
    public DbSet<TemperaturaRegistro> RegistrosTemperatura => Set<TemperaturaRegistro>();

    // ── Checklists ────────────────────────────────────────────────────────────
    public DbSet<ChecklistBPM> ChecklistsBPM => Set<ChecklistBPM>();
    public DbSet<ItemChecklist> ItemsChecklist => Set<ItemChecklist>();
    public DbSet<ResultadoChecklist> ResultadosChecklist => Set<ResultadoChecklist>();

    // ── No Conformidades ──────────────────────────────────────────────────────
    public DbSet<NoConformidad> NoConformidades => Set<NoConformidad>();
    public DbSet<AccionCorrectiva> AccionesCorrectivas => Set<AccionCorrectiva>();
    public DbSet<ComentarioNoConformidad> ComentariosNoConformidad => Set<ComentarioNoConformidad>();

    // ── Calidad: Verificación de instalaciones ───────────────────────────────
    public DbSet<VerificacionInstalacion> VerificacionesInstalaciones => Set<VerificacionInstalacion>();
    public DbSet<VerificacionInstalacionDetalle> VerificacionesInstalacionesDetalle => Set<VerificacionInstalacionDetalle>();

    // ── Auditoría ─────────────────────────────────────────────────────────────
    public DbSet<BitacoraAuditoria> BitacoraAuditoria => Set<BitacoraAuditoria>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Declarar explícitamente los Value Objects como tipos owned.
        modelBuilder.Owned<RangoTemperatura>();
        modelBuilder.Owned<VidaUtil>();

        // Aplica automáticamente todas las IEntityTypeConfiguration<T>
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        // Convención global: todos los decimal usan (18,4) por defecto.
        // Elimina los warnings "No store type was specified for decimal property".
        // Las Configurations individuales pueden sobrescribir con HasColumnType("decimal(x,y)").
        configurationBuilder.Properties<decimal>()
            .HavePrecision(18, 4);
    }
}