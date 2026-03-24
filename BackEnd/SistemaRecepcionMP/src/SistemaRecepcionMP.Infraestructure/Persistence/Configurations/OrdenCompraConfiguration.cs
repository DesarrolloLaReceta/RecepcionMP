using SistemaRecepcionMP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace SistemaRecepcionMP.Infraestructure.Persistence.Configurations;

public sealed class OrdenCompraConfiguration : IEntityTypeConfiguration<OrdenCompra>
{
    public void Configure(EntityTypeBuilder<OrdenCompra> builder)
    {
        builder.ToTable("OrdenesCompra");
        builder.HasKey(o => o.Id);

        builder.Property(o => o.NumeroOC).IsRequired().HasMaxLength(50);
        builder.Property(o => o.Estado).IsRequired().HasConversion<int>();
        builder.Property(o => o.Observaciones).HasMaxLength(500);
        builder.Property(o => o.CreadoEn).IsRequired();

        builder.HasIndex(o => o.NumeroOC).IsUnique();

        builder.HasOne(o => o.Proveedor)
            .WithMany(p => p.OrdenesCompra)
            .HasForeignKey(o => o.ProveedorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.UsuarioCreador)
            .WithMany()
            .HasForeignKey(o => o.CreadoPor)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(o => o.Detalles)
            .WithOne(d => d.OrdenCompra)
            .HasForeignKey(d => d.OrdenCompraId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(o => o.Recepciones)
            .WithOne(r => r.OrdenCompra)
            .HasForeignKey(r => r.OrdenCompraId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class DetalleOrdenCompraConfiguration : IEntityTypeConfiguration<DetalleOrdenCompra>
{
    public void Configure(EntityTypeBuilder<DetalleOrdenCompra> builder)
    {
        builder.ToTable("DetallesOrdenCompra");
        builder.HasKey(d => d.Id);

        builder.Property(d => d.CantidadSolicitada)
            .IsRequired().HasColumnType("decimal(12,3)");
        builder.Property(d => d.CantidadRecibida)
            .IsRequired().HasColumnType("decimal(12,3)").HasDefaultValue(0);
        builder.Property(d => d.CantidadRechazada)
            .IsRequired().HasColumnType("decimal(12,3)").HasDefaultValue(0);
        builder.Property(d => d.UnidadMedida).IsRequired().HasMaxLength(20);
        builder.Property(d => d.PrecioUnitario)
            .IsRequired().HasColumnType("decimal(16,2)");

        builder.HasOne(d => d.Item)
            .WithMany(i => i.DetallesOrdenCompra)
            .HasForeignKey(d => d.ItemId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}