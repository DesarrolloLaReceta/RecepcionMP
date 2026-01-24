using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RecepcionMP.Domain.Entities;

namespace RecepcionMP.Infrastructure.Persistence.Configurations
{
    public class DocumentoProveedorConfiguration : IEntityTypeConfiguration<DocumentoProveedor>
    {
        public void Configure(EntityTypeBuilder<DocumentoProveedor> builder)
        {
            builder.ToTable("DocumentosProveedor");

            builder.HasKey(d => d.Id);

            builder.HasOne(d => d.Proveedor)
                .WithMany(p => p.Documentos)
                .HasForeignKey(d => d.ProveedorId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Property(d => d.Tipo)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(d => d.RutaArchivo)
                .IsRequired()
                .HasMaxLength(500);

            builder.Property(d => d.FechaVencimiento);
        }
    }
}
