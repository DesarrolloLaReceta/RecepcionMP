using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RecepcionMP.Domain.Entities;

public class LoteConfiguration : IEntityTypeConfiguration<Lote>
{
    public void Configure(EntityTypeBuilder<Lote> builder)
    {
        builder.ToTable("Lotes");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.NumeroLote)
               .HasMaxLength(50)
               .IsRequired();

        builder.Property(l => l.UnidadMedida)
               .HasMaxLength(20)
               .IsRequired();

        builder.Property(l => l.CantidadRecibida)
               .HasPrecision(18, 2)
               .IsRequired();

    }
}
