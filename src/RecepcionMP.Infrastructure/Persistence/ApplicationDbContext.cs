using Microsoft.EntityFrameworkCore;
using RecepcionMP.Domain.Entities;
using RecepcionMP.Domain.Events;

namespace RecepcionMP.Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        

        // DbSets existentes
        public DbSet<Proveedor> Proveedores { get; set; }
        public DbSet<Item> Items { get; set; }
        public DbSet<OrdenCompra> OrdenesCompra { get; set; }
        public DbSet<Recepcion> Recepciones { get; set; }
        public DbSet<Lote> Lotes { get; set; }
        public DbSet<CheckListBPM> CheckListsBPM { get; set; }

        // Documentos:
        public DbSet<Categoria> Categorias { get; set; }
        public DbSet<DocumentoRequerido> DocumentosRequeridos { get; set; }
        public DbSet<RecepcionDocumento> RecepcionesDocumentos { get; set; }
        public DbSet<DocumentoValidacion> DocumentosValidacion { get; set; }
        public DbSet<DocumentoAdjunto> DocumentosAdjuntos { get; set; }
        public DbSet<RegistroAuditoria> RegistrosAuditoria { get; set; }
        public DbSet<CheckListBPMCategoria> CheckListsBPMCategorias { get; set; }

        // Calidad y No Conformidades:
        public DbSet<NoConformidad> NoConformidades { get; set; }
        public DbSet<AccionCorrectiva> AccionesCorrectivas { get; set; }
        public DbSet<LiberacionLote> LiberacionesLotes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Ignore<DomainEvent>();

            // Configuración de Categoria
            modelBuilder.Entity<Categoria>()
                .HasKey(c => c.Id);
            modelBuilder.Entity<Categoria>()
                .HasMany(c => c.Items)
                .WithOne(i => i.Categoria)
                .HasForeignKey(i => i.CategoriaId);
            modelBuilder.Entity<Categoria>()
                .HasMany(c => c.DocumentosRequeridos)
                .WithOne(d => d.Categoria)
                .HasForeignKey(d => d.CategoriaId);

            // Configuración de DocumentoRequerido
            modelBuilder.Entity<DocumentoRequerido>()
                .HasKey(d => d.Id);
            modelBuilder.Entity<DocumentoRequerido>()
                .HasMany(d => d.RecepcionesDocumentos)
                .WithOne(rd => rd.DocumentoRequerido)
                .HasForeignKey(rd => rd.DocumentoRequeridoId);

            // Configuración de RecepcionDocumento
            modelBuilder.Entity<RecepcionDocumento>()
                .HasKey(rd => rd.Id);
            modelBuilder.Entity<RecepcionDocumento>()
                .HasOne(rd => rd.Recepcion)
                .WithMany(r => r.Documentos)
                .HasForeignKey(rd => rd.RecepcionId);
            modelBuilder.Entity<RecepcionDocumento>()
                .HasIndex(rd => new { rd.RecepcionId, rd.DocumentoRequeridoId })
                .IsUnique();

            // Configuración de DocumentoValidacion
            modelBuilder.Entity<DocumentoValidacion>()
                .HasKey(dv => dv.Id);
            modelBuilder.Entity<DocumentoValidacion>()
                .HasOne(dv => dv.RecepcionDocumento)
                .WithMany()
                .HasForeignKey(dv => dv.RecepcionDocumentoId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<DocumentoValidacion>()
                .HasIndex(dv => new { dv.RecepcionDocumentoId, dv.Estado });
            modelBuilder.Entity<DocumentoValidacion>()
                .HasIndex(dv => dv.FechaValidacion);

            // Configuración de DocumentoAdjunto
            modelBuilder.Entity<DocumentoAdjunto>()
                .HasKey(da => da.Id);
            modelBuilder.Entity<DocumentoAdjunto>()
                .HasOne(da => da.RecepcionDocumento)
                .WithMany()
                .HasForeignKey(da => da.RecepcionDocumentoId);
            modelBuilder.Entity<DocumentoAdjunto>()
                .HasIndex(da => da.HashSHA256)
                .IsUnique();
            modelBuilder.Entity<DocumentoAdjunto>()
                .HasIndex(da => new { da.PendienteEliminacion, da.FechaEliminacion });

            // Configuración de RegistroAuditoria (auditoría)
            modelBuilder.Entity<RegistroAuditoria>()
                .HasKey(r => r.Id);
            modelBuilder.Entity<RegistroAuditoria>()
                .HasIndex(r => new { r.Tabla, r.RegistroId, r.FechaHora });
            modelBuilder.Entity<RegistroAuditoria>()
                .HasIndex(r => r.UsuarioId);

            // Configuración de CheckListBPMCategoria
            modelBuilder.Entity<CheckListBPMCategoria>()
                .HasKey(c => c.Id);
            modelBuilder.Entity<CheckListBPMCategoria>()
                .HasOne(c => c.Categoria)
                .WithMany(cat => cat.CheckListsVersionados)
                .HasForeignKey(c => c.CategoriaId);

            // Configuración de NoConformidad
            modelBuilder.Entity<NoConformidad>()
                .HasKey(nc => nc.Id);
            modelBuilder.Entity<NoConformidad>()
                .HasOne(nc => nc.Recepcion)
                .WithMany()
                .HasForeignKey(nc => nc.RecepcionId)
                .OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<NoConformidad>()
                .HasOne(nc => nc.Lote)
                .WithMany()
                .HasForeignKey(nc => nc.LoteId)
                .OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<NoConformidad>()
                .HasMany(nc => nc.AccionesCorrectivas)
                .WithOne(ac => ac.NoConformidad)
                .HasForeignKey(ac => ac.NoConformidadId);
            modelBuilder.Entity<NoConformidad>()
                .HasIndex(nc => new { nc.RecepcionId, nc.Estado });
            modelBuilder.Entity<NoConformidad>()
                .HasIndex(nc => nc.FechaRegistro);

            // Configuración de AccionCorrectiva
            modelBuilder.Entity<AccionCorrectiva>()
                .HasKey(ac => ac.Id);
            modelBuilder.Entity<AccionCorrectiva>()
                .HasOne(ac => ac.NoConformidad)
                .WithMany(nc => nc.AccionesCorrectivas)
                .HasForeignKey(ac => ac.NoConformidadId);
            modelBuilder.Entity<AccionCorrectiva>()
                .HasIndex(ac => new { ac.NoConformidadId, ac.Estado });
            modelBuilder.Entity<AccionCorrectiva>()
                .HasIndex(ac => ac.FechaVencimiento);
            modelBuilder.Entity<AccionCorrectiva>()
                .HasIndex(ac => ac.Responsable);

            // Configuración de LiberacionLote
            modelBuilder.Entity<LiberacionLote>()
                .HasKey(ll => ll.Id);
            modelBuilder.Entity<LiberacionLote>()
                .HasOne(ll => ll.Lote)
                .WithMany()
                .HasForeignKey(ll => ll.LoteId)
                .OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<LiberacionLote>()
                .HasOne(ll => ll.Recepcion)
                .WithMany()
                .HasForeignKey(ll => ll.RecepcionId)
                .OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<LiberacionLote>()
                .HasIndex(ll => ll.Estado);
            modelBuilder.Entity<LiberacionLote>()
                .HasIndex(ll => ll.FechaDecision);
        }
    }
}
