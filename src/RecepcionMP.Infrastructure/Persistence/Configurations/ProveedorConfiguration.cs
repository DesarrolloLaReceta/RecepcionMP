using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Infrastructure.Persistence.Configurations
{
    public class ProveedorConfiguration : IEntityTypeConfiguration<Proveedor>
    {
        public void Configure(EntityTypeBuilder<Proveedor> builder)
        {
            builder.ToTable("Proveedores");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.RazonSocial)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(p => p.NIT)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(p => p.Contacto)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(p => p.Email)
                .HasMaxLength(150);

            builder.Property(p => p.Telefono)
                .HasMaxLength(50);

            builder.Property(p => p.Activo)
                .HasDefaultValue(true);

            builder.Property(p => p.FechaCreacion)
                .HasDefaultValueSql("GETUTCDATE()");

            builder.HasMany(p => p.Documentos)
                .WithOne(d => d.Proveedor)
                .HasForeignKey(d => d.ProveedorId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
