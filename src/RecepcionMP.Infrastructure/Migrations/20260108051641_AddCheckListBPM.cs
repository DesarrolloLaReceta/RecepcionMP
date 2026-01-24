using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RecepcionMP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCheckListBPM : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ChecklistsBPM_RecepcionId",
                table: "ChecklistsBPM");

            migrationBuilder.DropColumn(
                name: "Categoria",
                table: "ChecklistsBPM");

            migrationBuilder.DropColumn(
                name: "EmpaqueIntegro",
                table: "ChecklistsBPM");

            migrationBuilder.DropColumn(
                name: "Observaciones",
                table: "ChecklistsBPM");

            migrationBuilder.DropColumn(
                name: "ProductoFresco",
                table: "ChecklistsBPM");

            migrationBuilder.DropColumn(
                name: "RotuladoCorrecto",
                table: "ChecklistsBPM");

            migrationBuilder.DropColumn(
                name: "VidaUtilAceptable",
                table: "ChecklistsBPM");

            migrationBuilder.AddColumn<DateTime>(
                name: "Fecha",
                table: "ChecklistsBPM",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "ObservacionesGenerales",
                table: "ChecklistsBPM",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CheckListItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CheckListBPMId = table.Column<int>(type: "int", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    EsConforme = table.Column<bool>(type: "bit", nullable: false),
                    EsCritico = table.Column<bool>(type: "bit", nullable: false),
                    Observacion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CheckListItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CheckListItems_ChecklistsBPM_CheckListBPMId",
                        column: x => x.CheckListBPMId,
                        principalTable: "ChecklistsBPM",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChecklistsBPM_RecepcionId",
                table: "ChecklistsBPM",
                column: "RecepcionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CheckListItems_CheckListBPMId",
                table: "CheckListItems",
                column: "CheckListBPMId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CheckListItems");

            migrationBuilder.DropIndex(
                name: "IX_ChecklistsBPM_RecepcionId",
                table: "ChecklistsBPM");

            migrationBuilder.DropColumn(
                name: "Fecha",
                table: "ChecklistsBPM");

            migrationBuilder.DropColumn(
                name: "ObservacionesGenerales",
                table: "ChecklistsBPM");

            migrationBuilder.AddColumn<string>(
                name: "Categoria",
                table: "ChecklistsBPM",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "EmpaqueIntegro",
                table: "ChecklistsBPM",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Observaciones",
                table: "ChecklistsBPM",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "ProductoFresco",
                table: "ChecklistsBPM",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "RotuladoCorrecto",
                table: "ChecklistsBPM",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "VidaUtilAceptable",
                table: "ChecklistsBPM",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_ChecklistsBPM_RecepcionId",
                table: "ChecklistsBPM",
                column: "RecepcionId");
        }
    }
}
