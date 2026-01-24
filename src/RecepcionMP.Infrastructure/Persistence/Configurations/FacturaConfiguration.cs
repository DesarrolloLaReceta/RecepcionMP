using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Infrastructure.Persistence.Configurations
{
    public class FacturaConfiguration : IEntityTypeConfiguration<Factura>
    {
        public void Configure(EntityTypeBuilder<Factura> builder)
        {
            builder.ToTable("Facturas");

            builder.HasKey(f => f.Id);

            builder.Property(f => f.NumeroFactura)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(f => f.RutaArchivo)
                .HasMaxLength(500);

            builder.HasOne(f => f.OrdenCompra)
                .WithMany()
                .HasForeignKey(f => f.OrdenCompraId);
        }
    }
}
