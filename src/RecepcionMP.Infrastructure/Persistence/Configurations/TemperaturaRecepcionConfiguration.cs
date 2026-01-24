using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Infrastructure.Persistence.Configurations
{
    public class TemperaturaRecepcionConfiguration : IEntityTypeConfiguration<TemperaturaRecepcion>
    {
        public void Configure(EntityTypeBuilder<TemperaturaRecepcion> builder)
        {
            builder.ToTable("TemperaturasRecepcion");

            builder.HasKey(t => t.Id);

            builder.Property(t => t.PuntoControl)
                .HasMaxLength(100);

        }
    }
}
