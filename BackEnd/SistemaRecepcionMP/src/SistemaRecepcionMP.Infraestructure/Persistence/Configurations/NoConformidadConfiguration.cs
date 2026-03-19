using SistemaRecepcionMP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace SistemaRecepcionMP.Infraestructure.Persistence.Configurations;

public sealed class NoConformidadConfiguration : IEntityTypeConfiguration<NoConformidad>
{
     public void Configure(EntityTypeBuilder<NoConformidad> builder)
    {
        builder.ToTable("NoConformidades");
        builder.HasKey(n => n.Id);

        builder.Property(n => n.Numero)
            .IsRequired().HasMaxLength(20);

        builder.Property(n => n.Titulo)
            .IsRequired().HasMaxLength(200);

        builder.Property(n => n.Descripcion)
            .IsRequired().HasMaxLength(500);

        builder.Property(n => n.AsignadoA)
            .HasMaxLength(200);

        builder.Property(n => n.CausaRaiz)
            .HasMaxLength(500);

        builder.Property(n => n.ObservacionesCierre)
            .HasMaxLength(500);

        builder.Property(n => n.CantidadAfectada)
            .HasPrecision(18, 4);

        builder.HasIndex(n => n.Numero).IsUnique();

        builder.HasMany(n => n.Comentarios)
            .WithOne(c => c.NoConformidad)
            .HasForeignKey(c => c.NoConformidadId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class AccionCorrectivaConfiguration : IEntityTypeConfiguration<AccionCorrectiva>
{
    public void Configure(EntityTypeBuilder<AccionCorrectiva> builder)
    {
        builder.ToTable("AccionesCorrectivas");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.DescripcionAccion)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(a => a.FechaCompromiso)
            .IsRequired();

        builder.Property(a => a.Estado)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(a => a.EvidenciaUrl)
            .HasMaxLength(500);

        builder.HasOne(a => a.UsuarioResponsable)
            .WithMany()
            .HasForeignKey(a => a.ResponsableId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class BitacoraAuditoriaConfiguration : IEntityTypeConfiguration<BitacoraAuditoria>
{
    public void Configure(EntityTypeBuilder<BitacoraAuditoria> builder)
    {
        builder.ToTable("BitacoraAuditoria");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.EntidadAfectada)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(b => b.RegistroId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(b => b.Accion)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        // Almacenamos JSON con el estado antes y después de la operación
        builder.Property(b => b.ValorAnterior)
            .HasColumnType("nvarchar(max)");

        builder.Property(b => b.ValorNuevo)
            .HasColumnType("nvarchar(max)");

        builder.Property(b => b.FechaHora)
            .IsRequired();

        builder.Property(b => b.IpOrigen)
            .HasMaxLength(45); // IPv6 máximo 45 chars

        builder.HasOne(b => b.Usuario)
            .WithMany()
            .HasForeignKey(b => b.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict);

        // Sin índice en ValorAnterior/ValorNuevo — son columnas de solo escritura
        builder.HasIndex(b => new { b.EntidadAfectada, b.RegistroId });
        builder.HasIndex(b => b.FechaHora);
    }
}

public sealed class ComentarioNoConformidadConfiguration : IEntityTypeConfiguration<ComentarioNoConformidad>
{
    public void Configure(EntityTypeBuilder<ComentarioNoConformidad> builder)
    {
        builder.ToTable("ComentariosNoConformidad");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Texto)
            .IsRequired().HasMaxLength(1000);

        builder.HasOne(c => c.Autor)
            .WithMany()
            .HasForeignKey(c => c.AutorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}