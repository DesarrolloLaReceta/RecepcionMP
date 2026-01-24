namespace RecepcionMP.Domain.Entities
{
    /// <summary>
    /// Bitácora inalterable de cambios - Cumplimiento Res. 2674/2013
    /// Quién, qué, cuándo, antes/después
    /// </summary>
    public class RegistroAuditoria
    {
        public int Id { get; set; }
        public string? UsuarioId { get; set; } // ID de Entra ID
        public string? NombreUsuario { get; set; }
        public string? Email { get; set; }
        public string? IP { get; set; }
        public DateTime FechaHora { get; set; } = DateTime.UtcNow;
        
        // Qué se modificó
        public string? Tabla { get; set; } // "Recepcion", "Lote", "Proveedor", etc.
        public int RegistroId { get; set; } // PK del registro modificado
        public TipoAccion Accion { get; set; }
        
        // Antes y después (JSON para flexibilidad)
        public string? ValoresAntes { get; set; } // JSON serializado
        public string? ValoresDespues { get; set; } // JSON serializado
        
        // Contexto
        public string? Descripcion { get; set; }
        public string? MotivoRechazo { get; set; } // Si aplica (rechazo de recepción, etc.)
    }

    public enum TipoAccion
    {
        Crear = 1,
        Actualizar = 2,
        Eliminar = 3,
        Rechazar = 4,
        Aprobar = 5,
        Liberar = 6,
        Bloquear = 7
    }
}