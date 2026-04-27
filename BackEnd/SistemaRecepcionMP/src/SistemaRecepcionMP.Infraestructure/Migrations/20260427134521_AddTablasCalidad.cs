using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SistemaRecepcionMP.Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTablasCalidad : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "VerificacionesInstalaciones",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Zona = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CumplimientoTotal = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VerificacionesInstalaciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VerificacionesInstalaciones_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VerificacionesInstalacionesDetalle",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VerificacionInstalacionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AspectoId = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    AspectoNombre = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Calificacion = table.Column<short>(type: "smallint", nullable: false),
                    Hallazgo = table.Column<string>(type: "nvarchar(1200)", maxLength: 1200, nullable: true),
                    PlanAccion = table.Column<string>(type: "nvarchar(1200)", maxLength: 1200, nullable: true),
                    Responsable = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    RutasFotos = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VerificacionesInstalacionesDetalle", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VerificacionesInstalacionesDetalle_VerificacionesInstalaciones_VerificacionInstalacionId",
                        column: x => x.VerificacionInstalacionId,
                        principalTable: "VerificacionesInstalaciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_VerificacionesInstalaciones_UsuarioId",
                table: "VerificacionesInstalaciones",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_VerificacionesInstalacionesDetalle_VerificacionInstalacionId",
                table: "VerificacionesInstalacionesDetalle",
                column: "VerificacionInstalacionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VerificacionesInstalacionesDetalle");

            migrationBuilder.DropTable(
                name: "VerificacionesInstalaciones");
        }
    }
}
