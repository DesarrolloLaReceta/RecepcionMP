using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RecepcionMP.Domain.Entities;

public class OrdenCompraItemConfiguration : IEntityTypeConfiguration<OrdenCompraItem>
{
    public void Configure(EntityTypeBuilder<OrdenCompraItem> builder)
    {
        builder.ToTable("OrdenCompraItems");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.CantidadEsperada)
            .HasPrecision(18, 3);

        builder.Property(i => i.UnidadMedida)
            .HasMaxLength(20);

        builder.HasOne(i => i.OrdenCompra)
            .WithMany(o => o.Items)
            .HasForeignKey(i => i.OrdenCompraId);

        builder.HasOne(i => i.Item)
            .WithMany()
            .HasForeignKey(i => i.ItemId);
    }
}
