using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Infrastructure.Persistence.Configurations
{
    public class ItemConfiguration : IEntityTypeConfiguration<Item>
    {
        public void Configure(EntityTypeBuilder<Item> builder)
        {
            builder.ToTable("Items");

            builder.HasKey(i => i.Id);

            builder.Property(i => i.Nombre)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(i => i.UnidadMedida)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(i => i.CategoriaSanitaria)
                .HasMaxLength(100);
        }
    }
}
