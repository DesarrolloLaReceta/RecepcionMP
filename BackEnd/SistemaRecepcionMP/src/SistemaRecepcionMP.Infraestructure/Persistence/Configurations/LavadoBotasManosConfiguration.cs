using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SistemaRecepcionMP.Domain.Entities;

namespace SistemaRecepcionMP.Infraestructure.Persistence.Configurations;

public sealed class LavadoBotasManosConfiguration : IEntityTypeConfiguration<LavadoBotasManos>
{
    public void Configure(EntityTypeBuilder<LavadoBotasManos> builder)
    {
        builder.ToTable("LavadosBotasManos");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Fecha)
            .IsRequired();

        builder.Property(x => x.Turno)
            .IsRequired()
            .HasMaxLength(40);

        builder.Property(x => x.Piso)
            .IsRequired()
            .HasMaxLength(40);

        builder.Property(x => x.Entrada)
            .IsRequired()
            .HasMaxLength(80);

        builder.Property(x => x.PersonasRevisadas)
            .IsRequired();

        builder.Property(x => x.Novedades)
            .HasMaxLength(2000);

        builder.Property(x => x.Observaciones)
            .HasMaxLength(2000);

        builder.Property(x => x.FotoEvidenciaPath)
            .HasMaxLength(800);

        builder.HasOne(x => x.Usuario)
            .WithMany()
            .HasForeignKey(x => x.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

