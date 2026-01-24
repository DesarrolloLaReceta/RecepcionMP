using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RecepcionMP.Domain.Entities;

public class OrdenCompraConfiguration : IEntityTypeConfiguration<OrdenCompra>
{
    public void Configure(EntityTypeBuilder<OrdenCompra> builder)
    {
        builder.ToTable("OrdenesCompra");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.NumeroOrden)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(o => o.NumeroOrden)
            .IsUnique();

        builder.Property(o => o.Estado)
            .IsRequired();

        builder.HasOne(o => o.Proveedor)
            .WithMany()
            .HasForeignKey(o => o.ProveedorId);
    }
}
