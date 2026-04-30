using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SistemaRecepcionMP.Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class AddResponsableToLavadoYVerificacion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CargoResponsable",
                table: "LavadosBotasManos",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NombreResponsable",
                table: "LavadosBotasManos",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CargoResponsable",
                table: "LavadosBotasManos");

            migrationBuilder.DropColumn(
                name: "NombreResponsable",
                table: "LavadosBotasManos");
        }
    }
}
