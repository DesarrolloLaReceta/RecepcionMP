using SistemaRecepcionMP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace SistemaRecepcionMP.Infraestructure.Persistence.Configurations;

public sealed class RecepcionConfiguration : IEntityTypeConfiguration<Recepcion>
{
    public void Configure(EntityTypeBuilder<Recepcion> builder)
    {
        builder.ToTable("Recepciones");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.NumeroRecepcion)
            .IsRequired()
            .HasMaxLength(30);

        builder.Property(r => r.FechaRecepcion)
            .IsRequired();

        builder.Property(r => r.PlacaVehiculo)
            .HasMaxLength(10);

        builder.Property(r => r.NombreTransportista)
            .HasMaxLength(150);

        builder.Property(r => r.Estado)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(r => r.ObservacionesGenerales)
            .HasMaxLength(500);

        builder.Property(r => r.CreadoEn)
            .IsRequired();

        builder.HasIndex(r => r.NumeroRecepcion).IsUnique();

        builder.Property(r => r.OrdenCompraId)
            .IsRequired();

        builder.HasOne(r => r.OrdenCompra)
            .WithMany()
            .HasForeignKey(r => r.OrdenCompraId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Proveedor)
            .WithMany()
            .HasForeignKey(r => r.ProveedorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.UsuarioCreador)
            .WithMany()
            .HasForeignKey(r => r.CreadoPor)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Factura)
            .WithOne(f => f.Recepcion)
            .HasForeignKey<Factura>(f => f.RecepcionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.InspeccionVehiculo)
            .WithOne(i => i.Recepcion)
            .HasForeignKey<InspeccionVehiculo>(i => i.RecepcionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(r => r.Lotes)
            .WithOne(l => l.Recepcion)
            .HasForeignKey(l => l.RecepcionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(r => r.Documentos)
            .WithOne(d => d.Recepcion)
            .HasForeignKey(d => d.RecepcionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(r => r.RegistrosTemperatura)
            .WithOne(t => t.Recepcion)
            .HasForeignKey(t => t.RecepcionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class FacturaConfiguration : IEntityTypeConfiguration<Factura>
{
    public void Configure(EntityTypeBuilder<Factura> builder)
    {
        builder.ToTable("Facturas");

        builder.HasKey(f => f.Id);

        builder.Property(f => f.NumeroFactura)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(f => f.FechaFactura)
            .IsRequired();

        builder.Property(f => f.ValorTotal)
            .IsRequired()
            .HasColumnType("decimal(16,2)");

        builder.Property(f => f.AdjuntoUrl)
            .HasMaxLength(500);

        builder.Property(f => f.NotaCreditoNumero)
            .HasMaxLength(50);

        builder.Property(f => f.NotaCreditoValor)
            .HasColumnType("decimal(16,2)");
    }
}

public sealed class InspeccionVehiculoConfiguration : IEntityTypeConfiguration<InspeccionVehiculo>
{
    public void Configure(EntityTypeBuilder<InspeccionVehiculo> builder)
    {
        builder.ToTable("InspeccionesVehiculo");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.TemperaturaInicial)
            .HasColumnType("decimal(5,2)");

        builder.Property(i => i.Resultado)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(i => i.Observaciones)
            .HasMaxLength(500);

        builder.Property(i => i.FechaRegistro)
            .IsRequired();

        builder.HasOne(i => i.UsuarioRegistrador)
            .WithMany()
            .HasForeignKey(i => i.RegistradoPor)
            .OnDelete(DeleteBehavior.Restrict);
    }
}