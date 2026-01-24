namespace RecepcionMP.Application.DTOs.Proveedor
{
    public class UpdateProveedorDto
    {
        public string RazonSocial { get; set; }
        public string Contacto { get; set; }
        public string? Email { get; set; }
        public string? Telefono { get; set; }
        public bool Activo { get; set; }
    }
}
