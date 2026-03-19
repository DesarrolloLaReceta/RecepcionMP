using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SistemaRecepcionMP.Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class EnriquecerNoConformidad : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_NoConformidades_CausalesNoConformidad_CausalId",
                table: "NoConformidades");

            migrationBuilder.DropForeignKey(
                name: "FK_NoConformidades_CausalesNoConformidad_CausalNoConformidadId",
                table: "NoConformidades");

            migrationBuilder.DropForeignKey(
                name: "FK_NoConformidades_Usuarios_CreadoPor",
                table: "NoConformidades");

            migrationBuilder.DropIndex(
                name: "IX_NoConformidades_CausalNoConformidadId",
                table: "NoConformidades");

            migrationBuilder.DropIndex(
                name: "IX_NoConformidades_CreadoPor",
                table: "NoConformidades");

            migrationBuilder.DropColumn(
                name: "CausalNoConformidadId",
                table: "NoConformidades");

            migrationBuilder.AlterColumn<int>(
                name: "Tipo",
                table: "NoConformidades",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<int>(
                name: "Estado",
                table: "NoConformidades",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<decimal>(
                name: "CantidadAfectada",
                table: "NoConformidades",
                type: "decimal(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(12,3)",
                oldPrecision: 18,
                oldScale: 4);

            migrationBuilder.AddColumn<string>(
                name: "AsignadoA",
                table: "NoConformidades",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CausaRaiz",
                table: "NoConformidades",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaCierre",
                table: "NoConformidades",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "FechaLimite",
                table: "NoConformidades",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Numero",
                table: "NoConformidades",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ObservacionesCierre",
                table: "NoConformidades",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Prioridad",
                table: "NoConformidades",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Titulo",
                table: "NoConformidades",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "UsuarioCreadorId",
                table: "NoConformidades",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "ComentariosNoConformidad",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NoConformidadId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Texto = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    AutorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FechaRegistro = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComentariosNoConformidad", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ComentariosNoConformidad_NoConformidades_NoConformidadId",
                        column: x => x.NoConformidadId,
                        principalTable: "NoConformidades",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ComentariosNoConformidad_Usuarios_AutorId",
                        column: x => x.AutorId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NoConformidades_Numero",
                table: "NoConformidades",
                column: "Numero",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NoConformidades_UsuarioCreadorId",
                table: "NoConformidades",
                column: "UsuarioCreadorId");

            migrationBuilder.CreateIndex(
                name: "IX_ComentariosNoConformidad_AutorId",
                table: "ComentariosNoConformidad",
                column: "AutorId");

            migrationBuilder.CreateIndex(
                name: "IX_ComentariosNoConformidad_NoConformidadId",
                table: "ComentariosNoConformidad",
                column: "NoConformidadId");

            migrationBuilder.AddForeignKey(
                name: "FK_NoConformidades_CausalesNoConformidad_CausalId",
                table: "NoConformidades",
                column: "CausalId",
                principalTable: "CausalesNoConformidad",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_NoConformidades_Usuarios_UsuarioCreadorId",
                table: "NoConformidades",
                column: "UsuarioCreadorId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_NoConformidades_CausalesNoConformidad_CausalId",
                table: "NoConformidades");

            migrationBuilder.DropForeignKey(
                name: "FK_NoConformidades_Usuarios_UsuarioCreadorId",
                table: "NoConformidades");

            migrationBuilder.DropTable(
                name: "ComentariosNoConformidad");

            migrationBuilder.DropIndex(
                name: "IX_NoConformidades_Numero",
                table: "NoConformidades");

            migrationBuilder.DropIndex(
                name: "IX_NoConformidades_UsuarioCreadorId",
                table: "NoConformidades");

            migrationBuilder.DropColumn(
                name: "AsignadoA",
                table: "NoConformidades");

            migrationBuilder.DropColumn(
                name: "CausaRaiz",
                table: "NoConformidades");

            migrationBuilder.DropColumn(
                name: "FechaCierre",
                table: "NoConformidades");

            migrationBuilder.DropColumn(
                name: "FechaLimite",
                table: "NoConformidades");

            migrationBuilder.DropColumn(
                name: "Numero",
                table: "NoConformidades");

            migrationBuilder.DropColumn(
                name: "ObservacionesCierre",
                table: "NoConformidades");

            migrationBuilder.DropColumn(
                name: "Prioridad",
                table: "NoConformidades");

            migrationBuilder.DropColumn(
                name: "Titulo",
                table: "NoConformidades");

            migrationBuilder.DropColumn(
                name: "UsuarioCreadorId",
                table: "NoConformidades");

            migrationBuilder.AlterColumn<string>(
                name: "Tipo",
                table: "NoConformidades",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "Estado",
                table: "NoConformidades",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<decimal>(
                name: "CantidadAfectada",
                table: "NoConformidades",
                type: "decimal(12,3)",
                precision: 18,
                scale: 4,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,4)",
                oldPrecision: 18,
                oldScale: 4);

            migrationBuilder.AddColumn<Guid>(
                name: "CausalNoConformidadId",
                table: "NoConformidades",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_NoConformidades_CausalNoConformidadId",
                table: "NoConformidades",
                column: "CausalNoConformidadId");

            migrationBuilder.CreateIndex(
                name: "IX_NoConformidades_CreadoPor",
                table: "NoConformidades",
                column: "CreadoPor");

            migrationBuilder.AddForeignKey(
                name: "FK_NoConformidades_CausalesNoConformidad_CausalId",
                table: "NoConformidades",
                column: "CausalId",
                principalTable: "CausalesNoConformidad",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_NoConformidades_CausalesNoConformidad_CausalNoConformidadId",
                table: "NoConformidades",
                column: "CausalNoConformidadId",
                principalTable: "CausalesNoConformidad",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_NoConformidades_Usuarios_CreadoPor",
                table: "NoConformidades",
                column: "CreadoPor",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
