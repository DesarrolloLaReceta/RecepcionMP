using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RecepcionMP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PermitirMotivoRechazoNulo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "MotivoRechazo",
                table: "RegistrosAuditoria",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "ActualizadoPor",
                table: "Recepciones",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaActualizacion",
                table: "Recepciones",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "RequiereAprobacionCalidad",
                table: "Recepciones",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActualizadoPor",
                table: "Recepciones");

            migrationBuilder.DropColumn(
                name: "FechaActualizacion",
                table: "Recepciones");

            migrationBuilder.DropColumn(
                name: "RequiereAprobacionCalidad",
                table: "Recepciones");

            migrationBuilder.AlterColumn<string>(
                name: "MotivoRechazo",
                table: "RegistrosAuditoria",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);
        }
    }
}
