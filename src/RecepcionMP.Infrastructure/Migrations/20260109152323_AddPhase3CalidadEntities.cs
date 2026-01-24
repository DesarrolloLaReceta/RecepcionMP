using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RecepcionMP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPhase3CalidadEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LiberacionesLotes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LoteId = table.Column<int>(type: "int", nullable: false),
                    RecepcionId = table.Column<int>(type: "int", nullable: false),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    FechaDecision = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LiberadoPor = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MotivoRechazo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaUltimaActualizacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LoteId1 = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LiberacionesLotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LiberacionesLotes_Lotes_LoteId",
                        column: x => x.LoteId,
                        principalTable: "Lotes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_LiberacionesLotes_Lotes_LoteId1",
                        column: x => x.LoteId1,
                        principalTable: "Lotes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_LiberacionesLotes_Recepciones_RecepcionId",
                        column: x => x.RecepcionId,
                        principalTable: "Recepciones",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "NoConformidades",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RecepcionId = table.Column<int>(type: "int", nullable: false),
                    LoteId = table.Column<int>(type: "int", nullable: false),
                    Tipo = table.Column<int>(type: "int", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CantidadAfectada = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UnidadMedida = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Causa = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FechaRegistro = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    RegistradoPor = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FechaUltimaActualizacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LoteId1 = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NoConformidades", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NoConformidades_Lotes_LoteId",
                        column: x => x.LoteId,
                        principalTable: "Lotes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_NoConformidades_Lotes_LoteId1",
                        column: x => x.LoteId1,
                        principalTable: "Lotes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_NoConformidades_Recepciones_RecepcionId",
                        column: x => x.RecepcionId,
                        principalTable: "Recepciones",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "AccionesCorrectivas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoConformidadId = table.Column<int>(type: "int", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Responsable = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaVencimiento = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaCompletacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreadaPor = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CerradaPor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaUltimaActualizacion = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccionesCorrectivas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AccionesCorrectivas_NoConformidades_NoConformidadId",
                        column: x => x.NoConformidadId,
                        principalTable: "NoConformidades",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AccionesCorrectivas_FechaVencimiento",
                table: "AccionesCorrectivas",
                column: "FechaVencimiento");

            migrationBuilder.CreateIndex(
                name: "IX_AccionesCorrectivas_NoConformidadId_Estado",
                table: "AccionesCorrectivas",
                columns: new[] { "NoConformidadId", "Estado" });

            migrationBuilder.CreateIndex(
                name: "IX_AccionesCorrectivas_Responsable",
                table: "AccionesCorrectivas",
                column: "Responsable");

            migrationBuilder.CreateIndex(
                name: "IX_LiberacionesLotes_Estado",
                table: "LiberacionesLotes",
                column: "Estado");

            migrationBuilder.CreateIndex(
                name: "IX_LiberacionesLotes_FechaDecision",
                table: "LiberacionesLotes",
                column: "FechaDecision");

            migrationBuilder.CreateIndex(
                name: "IX_LiberacionesLotes_LoteId",
                table: "LiberacionesLotes",
                column: "LoteId");

            migrationBuilder.CreateIndex(
                name: "IX_LiberacionesLotes_LoteId1",
                table: "LiberacionesLotes",
                column: "LoteId1",
                unique: true,
                filter: "[LoteId1] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_LiberacionesLotes_RecepcionId",
                table: "LiberacionesLotes",
                column: "RecepcionId");

            migrationBuilder.CreateIndex(
                name: "IX_NoConformidades_FechaRegistro",
                table: "NoConformidades",
                column: "FechaRegistro");

            migrationBuilder.CreateIndex(
                name: "IX_NoConformidades_LoteId",
                table: "NoConformidades",
                column: "LoteId");

            migrationBuilder.CreateIndex(
                name: "IX_NoConformidades_LoteId1",
                table: "NoConformidades",
                column: "LoteId1");

            migrationBuilder.CreateIndex(
                name: "IX_NoConformidades_RecepcionId_Estado",
                table: "NoConformidades",
                columns: new[] { "RecepcionId", "Estado" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccionesCorrectivas");

            migrationBuilder.DropTable(
                name: "LiberacionesLotes");

            migrationBuilder.DropTable(
                name: "NoConformidades");
        }
    }
}
