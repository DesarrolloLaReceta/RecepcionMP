using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RecepcionMP.Domain.Entities;

public class RecepcionConfiguration : IEntityTypeConfiguration<Recepcion>
{
    public void Configure(EntityTypeBuilder<Recepcion> builder)
    {
        builder.ToTable("Recepciones");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.FechaRecepcion)
               .IsRequired();

        builder.Property(r => r.PlacaVehiculo)
               .HasMaxLength(20);

        builder.Property(r => r.NombreTransportista)
               .HasMaxLength(100);

        builder.Property(r => r.Estado)
               .HasConversion<string>()
               .IsRequired();

        // Orden de Compra
        builder.HasOne(r => r.OrdenCompra)
               .WithMany()
               .HasForeignKey(r => r.OrdenCompraId)
               .OnDelete(DeleteBehavior.Restrict);

        // Factura
        builder.HasOne(r => r.Factura)
               .WithMany()
               .HasForeignKey(r => r.FacturaId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
