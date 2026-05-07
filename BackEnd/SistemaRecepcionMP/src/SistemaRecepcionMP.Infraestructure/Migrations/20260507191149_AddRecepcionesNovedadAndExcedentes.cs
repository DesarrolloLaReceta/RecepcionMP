using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SistemaRecepcionMP.Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRecepcionesNovedadAndExcedentes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RecepcionesNovedad",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RecepcionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TipoNovedad = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    FechaDeteccionUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DetectadaPorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Origen = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Observacion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecepcionesNovedad", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecepcionesNovedad_Recepciones_RecepcionId",
                        column: x => x.RecepcionId,
                        principalTable: "Recepciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RecepcionesNovedad_Usuarios_DetectadaPorUserId",
                        column: x => x.DetectadaPorUserId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RecepcionesNovedadDetalle",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RecepcionNovedadId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RecepcionItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CantidadFisica = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    CantidadSiesa = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    Diferencia = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    UnidadMedida = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecepcionesNovedadDetalle", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecepcionesNovedadDetalle_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RecepcionesNovedadDetalle_RecepcionItem_RecepcionItemId",
                        column: x => x.RecepcionItemId,
                        principalTable: "RecepcionItem",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RecepcionesNovedadDetalle_RecepcionesNovedad_RecepcionNovedadId",
                        column: x => x.RecepcionNovedadId,
                        principalTable: "RecepcionesNovedad",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RecepcionesNovedadNotificacion",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RecepcionNovedadId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Canal = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Destinatario = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Asunto = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Resultado = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    FechaEnvioUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ErrorTecnico = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecepcionesNovedadNotificacion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecepcionesNovedadNotificacion_RecepcionesNovedad_RecepcionNovedadId",
                        column: x => x.RecepcionNovedadId,
                        principalTable: "RecepcionesNovedad",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RecepcionesNovedad_DetectadaPorUserId",
                table: "RecepcionesNovedad",
                column: "DetectadaPorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RecepcionesNovedad_RecepcionId",
                table: "RecepcionesNovedad",
                column: "RecepcionId");

            migrationBuilder.CreateIndex(
                name: "IX_RecepcionesNovedadDetalle_ItemId",
                table: "RecepcionesNovedadDetalle",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_RecepcionesNovedadDetalle_RecepcionItemId",
                table: "RecepcionesNovedadDetalle",
                column: "RecepcionItemId");

            migrationBuilder.CreateIndex(
                name: "IX_RecepcionesNovedadDetalle_RecepcionNovedadId",
                table: "RecepcionesNovedadDetalle",
                column: "RecepcionNovedadId");

            migrationBuilder.CreateIndex(
                name: "IX_RecepcionesNovedadNotificacion_RecepcionNovedadId",
                table: "RecepcionesNovedadNotificacion",
                column: "RecepcionNovedadId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RecepcionesNovedadDetalle");

            migrationBuilder.DropTable(
                name: "RecepcionesNovedadNotificacion");

            migrationBuilder.DropTable(
                name: "RecepcionesNovedad");
        }
    }
}
