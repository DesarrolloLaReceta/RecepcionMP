using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SistemaRecepcionMP.Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTipoCriterioToItemChecklist : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TipoCriterio",
                table: "ItemsChecklist",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Unidad",
                table: "ItemsChecklist",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ValorMaximo",
                table: "ItemsChecklist",
                type: "decimal(18,4)",
                precision: 18,
                scale: 4,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ValorMinimo",
                table: "ItemsChecklist",
                type: "decimal(18,4)",
                precision: 18,
                scale: 4,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TipoCriterio",
                table: "ItemsChecklist");

            migrationBuilder.DropColumn(
                name: "Unidad",
                table: "ItemsChecklist");

            migrationBuilder.DropColumn(
                name: "ValorMaximo",
                table: "ItemsChecklist");

            migrationBuilder.DropColumn(
                name: "ValorMinimo",
                table: "ItemsChecklist");
        }
    }
}
