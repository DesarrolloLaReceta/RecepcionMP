using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Infrastructure.Persistence.Configurations
{
    public class NoConformidadConfiguration : IEntityTypeConfiguration<NoConformidad>
    {
        public void Configure(EntityTypeBuilder<NoConformidad> builder)
        {
            builder.ToTable("NoConformidades");

            builder.HasKey(n => n.Id);

            builder.Property(n => n.Descripcion)
                .HasMaxLength(500);

            builder.Property(n => n.AccionesCorrectivas)
                .HasMaxLength(500);

        }
    }
}
