using SistemaRecepcionMP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace SistemaRecepcionMP.Infraestructure.Persistence.Configurations;

public sealed class LiberacionLoteConfiguration : IEntityTypeConfiguration<LiberacionLote>
{
    public void Configure(EntityTypeBuilder<LiberacionLote> builder)
    {
        builder.ToTable("LiberacionesLote");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.Decision)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(l => l.Observaciones)
            .HasMaxLength(500);

        builder.Property(l => l.FechaLiberacion)
            .IsRequired();

        builder.HasOne(l => l.UsuarioCalidad)
            .WithMany()
            .HasForeignKey(l => l.LiberadoPor)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class CuarentenaConfiguration : IEntityTypeConfiguration<Cuarentena>
{
    public void Configure(EntityTypeBuilder<Cuarentena> builder)
    {
        builder.ToTable("Cuarentenas");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.FechaCuarentena)
            .IsRequired();

        builder.Property(c => c.Motivo)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(c => c.Decision)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(c => c.AccionesRealizadas)
            .HasMaxLength(500);

        builder.HasOne(c => c.UsuarioCalidad)
            .WithMany()
            .HasForeignKey(c => c.SeguidoPor)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class DocumentoRecepcionConfiguration : IEntityTypeConfiguration<DocumentoRecepcion>
{
    public void Configure(EntityTypeBuilder<DocumentoRecepcion> builder)
    {
        builder.ToTable("DocumentosRecepcion");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.TipoDocumento)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(d => d.NombreArchivo)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(d => d.AdjuntoUrl)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(d => d.FechaCarga)
            .IsRequired();

        // EsValido es nullable — null = pendiente de revisión
        builder.Property(d => d.EsValido);

        builder.HasOne(d => d.UsuarioCargador)
            .WithMany()
            .HasForeignKey(d => d.CargadoPor)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class TemperaturaRegistroConfiguration : IEntityTypeConfiguration<TemperaturaRegistro>
{
    public void Configure(EntityTypeBuilder<TemperaturaRegistro> builder)
    {
        builder.ToTable("RegistrosTemperatura");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Temperatura)
            .IsRequired()
            .HasColumnType("decimal(5,2)");

        builder.Property(t => t.UnidadMedida)
            .IsRequired()
            .HasMaxLength(5);

        builder.Property(t => t.FechaHora)
            .IsRequired();

        builder.Property(t => t.Origen)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(t => t.DispositivoId)
            .HasMaxLength(100);

        builder.Property(t => t.EstaFueraDeRango)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(t => t.Observacion)
            .HasMaxLength(300);

        builder.HasOne(t => t.UsuarioRegistrador)
            .WithMany()
            .HasForeignKey(t => t.RegistradoPor)
            .OnDelete(DeleteBehavior.Restrict);
    }
}