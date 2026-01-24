using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Infrastructure.Persistence.Configurations
{
    public class CheckListItemConfiguration : IEntityTypeConfiguration<CheckListItem>
    {
        public void Configure(EntityTypeBuilder<CheckListItem> builder)
        {
            builder.ToTable("CheckListItems");

            builder.HasKey(i => i.Id);

            builder.Property(i => i.Nombre)
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(i => i.Observacion)
                   .HasMaxLength(500);
        }
    }
}
