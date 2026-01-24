using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Infrastructure.Persistence.Configurations
{
    public class CheckListBPMConfiguration : IEntityTypeConfiguration<CheckListBPM>
    {
        public void Configure(EntityTypeBuilder<CheckListBPM> builder)
        {
            builder.ToTable("ChecklistsBPM");

            builder.HasKey(c => c.Id);

            // Relación 1–1 con Recepcion
            builder.HasOne(c => c.Recepcion)
                   .WithOne(r => r.CheckListBPM)
                   .HasForeignKey<CheckListBPM>(c => c.RecepcionId);

            // Relación 1–N con CheckListItem
            builder.HasMany(c => c.Items)
                   .WithOne(i => i.CheckListBPM)
                   .HasForeignKey(i => i.CheckListBPMId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
