using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SistemaRecepcionMP.Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLiberacionCocinaDiaria : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LiberacionesCocinas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Turno = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Cocina = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ObservacionesInspeccion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NombreResponsable = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CargoResponsable = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ObservacionesGenerales = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LiberacionesCocinas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DetallesInspeccionCocinas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LiberacionCocinaId = table.Column<int>(type: "int", nullable: false),
                    Item = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DetallesInspeccionCocinas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DetallesInspeccionCocinas_LiberacionesCocinas_LiberacionCocinaId",
                        column: x => x.LiberacionCocinaId,
                        principalTable: "LiberacionesCocinas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DetallesInspeccionCocinas_LiberacionCocinaId",
                table: "DetallesInspeccionCocinas",
                column: "LiberacionCocinaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DetallesInspeccionCocinas");

            migrationBuilder.DropTable(
                name: "LiberacionesCocinas");
        }
    }
}
