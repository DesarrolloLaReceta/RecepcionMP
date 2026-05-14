using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SistemaRecepcionMP.Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class AgregarLogicaMultiplesLotes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Idempotente: la migración inicial comentada impedía crear la tabla; en esquemas nuevos
            // la columna sombra puede no existir. SQL Server: comprobar antes de DROP / ALTER.
            migrationBuilder.Sql("""
                IF OBJECT_ID(N'dbo.LotesRecibidos', N'U') IS NULL
                    RETURN;

                IF COL_LENGTH(N'dbo.LotesRecibidos', N'LoteRecibido_FechaVencimiento') IS NOT NULL
                    ALTER TABLE [dbo].[LotesRecibidos] DROP COLUMN [LoteRecibido_FechaVencimiento];

                IF EXISTS (
                    SELECT 1
                    FROM sys.columns c
                    INNER JOIN sys.tables t ON c.object_id = t.object_id
                    INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
                    WHERE s.name = N'dbo' AND t.name = N'LotesRecibidos' AND c.name = N'FechaVencimiento' AND c.is_nullable = 1)
                BEGIN
                    UPDATE [dbo].[LotesRecibidos] SET [FechaVencimiento] = CAST(N'0001-01-01' AS date) WHERE [FechaVencimiento] IS NULL;
                    ALTER TABLE [dbo].[LotesRecibidos] ALTER COLUMN [FechaVencimiento] date NOT NULL;
                END
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateOnly>(
                name: "FechaVencimiento",
                table: "LotesRecibidos",
                type: "date",
                nullable: true,
                oldClrType: typeof(DateOnly),
                oldType: "date");

            migrationBuilder.AddColumn<DateOnly>(
                name: "LoteRecibido_FechaVencimiento",
                table: "LotesRecibidos",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));
        }
    }
}
