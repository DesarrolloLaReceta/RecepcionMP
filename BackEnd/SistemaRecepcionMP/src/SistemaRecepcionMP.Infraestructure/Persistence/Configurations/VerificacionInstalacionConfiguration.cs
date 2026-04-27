using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SistemaRecepcionMP.Domain.Entities;

namespace SistemaRecepcionMP.Infraestructure.Persistence.Configurations;

public sealed class VerificacionInstalacionConfiguration : IEntityTypeConfiguration<VerificacionInstalacion>
{
    public void Configure(EntityTypeBuilder<VerificacionInstalacion> builder)
    {
        builder.ToTable("VerificacionesInstalaciones");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Zona)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Fecha)
            .IsRequired();

        builder.Property(x => x.CumplimientoTotal)
            .HasPrecision(5, 2)
            .IsRequired();

        builder.HasOne(x => x.Usuario)
            .WithMany()
            .HasForeignKey(x => x.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Detalles)
            .WithOne(x => x.VerificacionInstalacion)
            .HasForeignKey(x => x.VerificacionInstalacionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class VerificacionInstalacionDetalleConfiguration : IEntityTypeConfiguration<VerificacionInstalacionDetalle>
{
    public void Configure(EntityTypeBuilder<VerificacionInstalacionDetalle> builder)
    {
        builder.ToTable("VerificacionesInstalacionesDetalle");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.AspectoId)
            .IsRequired()
            .HasMaxLength(80);

        builder.Property(x => x.AspectoNombre)
            .IsRequired()
            .HasMaxLength(250);

        builder.Property(x => x.Calificacion)
            .IsRequired();

        builder.Property(x => x.Hallazgo)
            .HasMaxLength(1200);

        builder.Property(x => x.PlanAccion)
            .HasMaxLength(1200);

        builder.Property(x => x.Responsable)
            .HasMaxLength(200);

        builder.Property(x => x.RutasFotos)
            .HasColumnType("nvarchar(max)");
    }
}

