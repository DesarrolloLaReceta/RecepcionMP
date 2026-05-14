using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SistemaRecepcionMP.Infraestructure.Migrations;

/// <inheritdoc />
public partial class AddVerificacionInstalacionResponsableYMes : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "CargoResponsable",
            table: "VerificacionesInstalaciones",
            type: "nvarchar(100)",
            maxLength: 100,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<string>(
            name: "NombreResponsable",
            table: "VerificacionesInstalaciones",
            type: "nvarchar(150)",
            maxLength: 150,
            nullable: false,
            defaultValue: "");

        migrationBuilder.Sql("""
            UPDATE vi
            SET vi.NombreResponsable = u.Nombre
            FROM VerificacionesInstalaciones AS vi
            INNER JOIN Usuarios AS u ON vi.UsuarioId = u.Id
            WHERE vi.NombreResponsable = N'' OR vi.NombreResponsable IS NULL
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "CargoResponsable",
            table: "VerificacionesInstalaciones");

        migrationBuilder.DropColumn(
            name: "NombreResponsable",
            table: "VerificacionesInstalaciones");
    }
}
