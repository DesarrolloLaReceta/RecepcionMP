using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SistemaRecepcionMP.Infraestructure.Migrations;

/// <summary>
/// Elimina relaciones duplicadas que generaban columnas sombra (RecepcionId1, OrdenCompraId1, ItemChecklistId1).
/// El script es idempotente para bases creadas ya sin esas columnas (p. ej. tras una inicial corregida).
/// </summary>
public partial class CorregirRelacionesSinPropiedadesSombra : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Facturas_Recepciones_RecepcionId1')
                ALTER TABLE [dbo].[Facturas] DROP CONSTRAINT [FK_Facturas_Recepciones_RecepcionId1];

            IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Recepciones_OrdenesCompra_OrdenCompraId1')
                ALTER TABLE [dbo].[Recepciones] DROP CONSTRAINT [FK_Recepciones_OrdenesCompra_OrdenCompraId1];

            IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_ResultadosChecklist_ItemsChecklist_ItemChecklistId1')
                ALTER TABLE [dbo].[ResultadosChecklist] DROP CONSTRAINT [FK_ResultadosChecklist_ItemsChecklist_ItemChecklistId1];

            IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ResultadosChecklist_ItemChecklistId1' AND object_id = OBJECT_ID(N'dbo.ResultadosChecklist', N'U'))
                DROP INDEX [IX_ResultadosChecklist_ItemChecklistId1] ON [dbo].[ResultadosChecklist];

            IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Recepciones_OrdenCompraId1' AND object_id = OBJECT_ID(N'dbo.Recepciones', N'U'))
                DROP INDEX [IX_Recepciones_OrdenCompraId1] ON [dbo].[Recepciones];

            IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Facturas_RecepcionId1' AND object_id = OBJECT_ID(N'dbo.Facturas', N'U'))
                DROP INDEX [IX_Facturas_RecepcionId1] ON [dbo].[Facturas];

            IF COL_LENGTH(N'dbo.ResultadosChecklist', N'ItemChecklistId1') IS NOT NULL
                ALTER TABLE [dbo].[ResultadosChecklist] DROP COLUMN [ItemChecklistId1];

            IF COL_LENGTH(N'dbo.Recepciones', N'OrdenCompraId1') IS NOT NULL
                ALTER TABLE [dbo].[Recepciones] DROP COLUMN [OrdenCompraId1];

            IF COL_LENGTH(N'dbo.Facturas', N'RecepcionId1') IS NOT NULL
                ALTER TABLE [dbo].[Facturas] DROP COLUMN [RecepcionId1];
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<Guid>(
            name: "ItemChecklistId1",
            table: "ResultadosChecklist",
            type: "uniqueidentifier",
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "OrdenCompraId1",
            table: "Recepciones",
            type: "uniqueidentifier",
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "RecepcionId1",
            table: "Facturas",
            type: "uniqueidentifier",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_ResultadosChecklist_ItemChecklistId1",
            table: "ResultadosChecklist",
            column: "ItemChecklistId1");

        migrationBuilder.CreateIndex(
            name: "IX_Recepciones_OrdenCompraId1",
            table: "Recepciones",
            column: "OrdenCompraId1");

        migrationBuilder.CreateIndex(
            name: "IX_Facturas_RecepcionId1",
            table: "Facturas",
            column: "RecepcionId1");

        migrationBuilder.AddForeignKey(
            name: "FK_Facturas_Recepciones_RecepcionId1",
            table: "Facturas",
            column: "RecepcionId1",
            principalTable: "Recepciones",
            principalColumn: "Id");

        migrationBuilder.AddForeignKey(
            name: "FK_Recepciones_OrdenesCompra_OrdenCompraId1",
            table: "Recepciones",
            column: "OrdenCompraId1",
            principalTable: "OrdenesCompra",
            principalColumn: "Id");

        migrationBuilder.AddForeignKey(
            name: "FK_ResultadosChecklist_ItemsChecklist_ItemChecklistId1",
            table: "ResultadosChecklist",
            column: "ItemChecklistId1",
            principalTable: "ItemsChecklist",
            principalColumn: "Id");
    }
}
