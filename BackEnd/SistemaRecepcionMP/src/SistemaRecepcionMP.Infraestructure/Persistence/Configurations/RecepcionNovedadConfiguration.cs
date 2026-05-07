using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SistemaRecepcionMP.Domain.Entities;

namespace SistemaRecepcionMP.Infraestructure.Persistence.Configurations;

public sealed class RecepcionNovedadConfiguration : IEntityTypeConfiguration<RecepcionNovedad>
{
    public void Configure(EntityTypeBuilder<RecepcionNovedad> builder)
    {
        builder.ToTable("RecepcionesNovedad");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.TipoNovedad)
            .HasConversion<string>()
            .HasMaxLength(60)
            .IsRequired();

        builder.Property(x => x.Estado)
            .HasConversion<string>()
            .HasMaxLength(40)
            .IsRequired();

        builder.Property(x => x.Origen)
            .HasMaxLength(80)
            .IsRequired();

        builder.Property(x => x.Observacion)
            .HasMaxLength(500);

        builder.HasOne(x => x.Recepcion)
            .WithMany()
            .HasForeignKey(x => x.RecepcionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.DetectadaPor)
            .WithMany()
            .HasForeignKey(x => x.DetectadaPorUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Detalles)
            .WithOne(x => x.RecepcionNovedad)
            .HasForeignKey(x => x.RecepcionNovedadId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Notificaciones)
            .WithOne(x => x.RecepcionNovedad)
            .HasForeignKey(x => x.RecepcionNovedadId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class RecepcionNovedadDetalleConfiguration : IEntityTypeConfiguration<RecepcionNovedadDetalle>
{
    public void Configure(EntityTypeBuilder<RecepcionNovedadDetalle> builder)
    {
        builder.ToTable("RecepcionesNovedadDetalle");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.UnidadMedida)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.CantidadFisica)
            .HasColumnType("decimal(18,4)");

        builder.Property(x => x.CantidadSiesa)
            .HasColumnType("decimal(18,4)");

        builder.Property(x => x.Diferencia)
            .HasColumnType("decimal(18,4)");

        builder.HasOne(x => x.RecepcionItem)
            .WithMany()
            .HasForeignKey(x => x.RecepcionItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Item)
            .WithMany()
            .HasForeignKey(x => x.ItemId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class RecepcionNovedadNotificacionConfiguration : IEntityTypeConfiguration<RecepcionNovedadNotificacion>
{
    public void Configure(EntityTypeBuilder<RecepcionNovedadNotificacion> builder)
    {
        builder.ToTable("RecepcionesNovedadNotificacion");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Canal)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.Destinatario)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Asunto)
            .HasMaxLength(250)
            .IsRequired();

        builder.Property(x => x.Resultado)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.ErrorTecnico)
            .HasMaxLength(1000);
    }
}
