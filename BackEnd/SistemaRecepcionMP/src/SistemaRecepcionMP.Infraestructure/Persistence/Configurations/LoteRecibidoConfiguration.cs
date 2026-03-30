using SistemaRecepcionMP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace SistemaRecepcionMP.Infraestructure.Persistence.Configurations;

public sealed class LoteRecibidoConfiguration : IEntityTypeConfiguration<LoteRecibido>
{
    public void Configure(EntityTypeBuilder<LoteRecibido> builder)
    {
        builder.ToTable("LotesRecibidos");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.NumeroLoteProveedor).HasMaxLength(100);
        builder.Property(l => l.CodigoLoteInterno).IsRequired().HasMaxLength(50);
        builder.Property(l => l.CodigoQr).HasMaxLength(500);
        builder.Property(l => l.CantidadRecibida).IsRequired().HasColumnType("decimal(12,3)");
        builder.Property(l => l.CantidadRechazada).IsRequired().HasColumnType("decimal(12,3)").HasDefaultValue(0);
        builder.Property(l => l.UnidadMedida).IsRequired().HasMaxLength(20);
        builder.Property(l => l.TemperaturaMedida).HasColumnType("decimal(5,2)");
        builder.Property(l => l.EstadoSensorial).IsRequired().HasConversion<string>().HasMaxLength(50);
        builder.Property(l => l.EstadoRotulado).IsRequired().HasConversion<string>().HasMaxLength(50);
        builder.Property(l => l.Estado).IsRequired().HasConversion<string>().HasMaxLength(50);
        builder.Property(l => l.UbicacionDestino).HasConversion<string>().HasMaxLength(50);
        builder.Property(l => l.FechaRegistro).IsRequired();

        // Value Object VidaUtil
        builder.OwnsOne(l => l.VidaUtil, vu =>
        {
            vu.Property(v => v.FechaVencimiento).HasColumnName("FechaVencimiento").IsRequired();
            vu.Ignore(v => v.DiasRestantes);
            vu.Ignore(v => v.EstaVencido);
        });

        builder.HasIndex(l => l.CodigoLoteInterno).IsUnique();

        // Relaciones
        builder.HasOne(l => l.RecepcionItem)
            .WithMany(ri => ri.Lotes)
            .HasForeignKey(l => l.RecepcionItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Ignore(l => l.Recepcion);

        builder.HasOne(l => l.UsuarioRegistrador)
            .WithMany()
            .HasForeignKey(l => l.RegistradoPor)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(l => l.Liberacion)
            .WithOne(lib => lib.LoteRecibido)
            .HasForeignKey<LiberacionLote>(lib => lib.LoteRecibidoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(l => l.Cuarentena)
            .WithOne(c => c.LoteRecibido)
            .HasForeignKey<Cuarentena>(c => c.LoteRecibidoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(l => l.NoConformidades)
            .WithOne(nc => nc.LoteRecibido)
            .HasForeignKey(nc => nc.LoteRecibidoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(l => l.ResultadosChecklist)
            .WithOne(r => r.LoteRecibido)
            .HasForeignKey(r => r.LoteRecibidoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(l => l.Documentos)
            .WithOne(d => d.LoteRecibido)
            .HasForeignKey(d => d.LoteRecibidoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(l => l.RegistrosTemperatura)
            .WithOne(t => t.LoteRecibido)
            .HasForeignKey(t => t.LoteRecibidoId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}