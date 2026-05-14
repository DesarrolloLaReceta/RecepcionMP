using SistemaRecepcionMP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace SistemaRecepcionMP.Infraestructure.Persistence.Configurations;

public sealed class ChecklistBPMConfiguration : IEntityTypeConfiguration<ChecklistBPM>
{
    public void Configure(EntityTypeBuilder<ChecklistBPM> builder)
    {
        builder.ToTable("ChecklistsBPM");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Nombre)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.CategoriaId)
            .IsRequired();

        builder.Property(c => c.Version)
            .IsRequired();

        builder.Property(c => c.Estado)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(c => c.CreadoEn)
            .IsRequired();

        // Índice filtrado — solo un checklist activo por categoría
        // HasFilter usa sintaxis T-SQL (SQL Server)
        builder.HasIndex(c => new { c.CategoriaId, c.Estado })
            .HasFilter("[Estado] = 1")
            .IsUnique();

        // NO se configura HasOne<CategoriaItem> aquí — la FK CategoriaId
        // se mapea como propiedad simple. Evita la columna fantasma CategoriaId1.

        builder.HasMany(c => c.Items)
            .WithOne(i => i.Checklist)
            .HasForeignKey(i => i.ChecklistId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class ItemChecklistConfiguration : IEntityTypeConfiguration<ItemChecklist>
{
    public void Configure(EntityTypeBuilder<ItemChecklist> builder)
    {
        builder.ToTable("ItemsChecklist");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.Criterio)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(i => i.Descripcion)
            .HasMaxLength(500);

        builder.Property(i => i.EsCritico)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(i => i.Orden)
            .IsRequired();

        // Orden único dentro del mismo checklist
        builder.HasIndex(i => new { i.ChecklistId, i.Orden }).IsUnique();
    }
}

public sealed class ResultadoChecklistConfiguration : IEntityTypeConfiguration<ResultadoChecklist>
{
    public void Configure(EntityTypeBuilder<ResultadoChecklist> builder)
    {
        builder.ToTable("ResultadosChecklist");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.ItemChecklistId)
            .IsRequired();

        builder.Property(r => r.Resultado)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(r => r.Observacion)
            .HasMaxLength(300);

        builder.Property(r => r.FechaRegistro)
            .IsRequired();

        // Un lote solo tiene un resultado por ítem de checklist
        builder.HasIndex(r => new { r.LoteRecibidoId, r.ItemChecklistId }).IsUnique();

        builder.HasOne(r => r.Checklist)
            .WithMany(c => c.Resultados)
            .HasForeignKey(r => r.ChecklistId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.ItemChecklist)
            .WithMany(i => i.Resultados)
            .HasForeignKey(r => r.ItemChecklistId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.UsuarioRegistrador)
            .WithMany()
            .HasForeignKey(r => r.RegistradoPor)
            .OnDelete(DeleteBehavior.Restrict);
    }
}