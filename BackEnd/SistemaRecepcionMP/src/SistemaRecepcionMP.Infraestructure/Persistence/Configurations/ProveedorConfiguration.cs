using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace SistemaRecepcionMP.Infraestructure.Persistence.Configurations;

public sealed class ProveedorConfiguration : IEntityTypeConfiguration<Proveedor>
{
    public void Configure(EntityTypeBuilder<Proveedor> builder)
    {
        builder.ToTable("Proveedores");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.RazonSocial).IsRequired().HasMaxLength(200);
        builder.Property(p => p.Nit).IsRequired().HasMaxLength(20);
        builder.Property(p => p.Telefono).HasMaxLength(20);
        builder.Property(p => p.EmailContacto).HasMaxLength(150);
        builder.Property(p => p.Direccion).HasMaxLength(300);
        builder.Property(p => p.Estado)
            .IsRequired()
            .HasConversion<int>();
        builder.Property(p => p.CreadoEn).IsRequired();

        builder.HasMany(p => p.Contactos)
            .WithOne(c => c.Proveedor)
            .HasForeignKey(c => c.ProveedorId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.DocumentosSanitarios)
            .WithOne(d => d.Proveedor)
            .HasForeignKey(d => d.ProveedorId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.OrdenesCompra)
            .WithOne(oc => oc.Proveedor)
            .HasForeignKey(oc => oc.ProveedorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class ContactoProveedorConfiguration : IEntityTypeConfiguration<ContactoProveedor>
{
    public void Configure(EntityTypeBuilder<ContactoProveedor> builder)
    {
        builder.ToTable("ContactosProveedor");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Nombre).IsRequired().HasMaxLength(100);
        builder.Property(c => c.Cargo).HasMaxLength(100);
        builder.Property(c => c.Telefono).HasMaxLength(20);
        builder.Property(c => c.Email).HasMaxLength(150);
        builder.Property(c => c.EsPrincipal).IsRequired();
    }
}

public sealed class DocumentoSanitarioProveedorConfiguration : IEntityTypeConfiguration<DocumentoSanitarioProveedor>
{
    public void Configure(EntityTypeBuilder<DocumentoSanitarioProveedor> builder)
    {
        builder.ToTable("DocumentosSanitariosProveedor");
        builder.HasKey(d => d.Id);

        builder.Property(d => d.TipoDocumento)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(d => d.NumeroDocumento)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(d => d.FechaExpedicion).IsRequired();
        builder.Property(d => d.FechaVencimiento).IsRequired();

        builder.Property(d => d.AdjuntoUrl).HasMaxLength(500);

        // Ignorar propiedades calculadas — no van a la BD
        builder.Ignore(d => d.EstaVigente);
        builder.Ignore(d => d.EstaVencido);
        builder.Ignore(d => d.EstadoVigencia);
        builder.Ignore(d => d.DiasParaVencer);
    }
}