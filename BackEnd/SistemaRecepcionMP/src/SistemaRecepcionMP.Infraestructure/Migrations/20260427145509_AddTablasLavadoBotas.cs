using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SistemaRecepcionMP.Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTablasLavadoBotas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LavadosBotasManos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Turno = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Piso = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Entrada = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    PersonasRevisadas = table.Column<int>(type: "int", nullable: false),
                    Novedades = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Observaciones = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    FotoEvidenciaPath = table.Column<string>(type: "nvarchar(800)", maxLength: 800, nullable: true),
                    UsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LavadosBotasManos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LavadosBotasManos_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LavadosBotasManos_UsuarioId",
                table: "LavadosBotasManos",
                column: "UsuarioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LavadosBotasManos");
        }
    }
}
