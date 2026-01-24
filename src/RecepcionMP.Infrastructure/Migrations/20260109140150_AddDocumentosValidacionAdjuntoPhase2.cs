using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RecepcionMP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentosValidacionAdjuntoPhase2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CheckListItems_ChecklistsBPM_CheckListBPMId",
                table: "CheckListItems");

            migrationBuilder.DropForeignKey(
                name: "FK_ChecklistsBPM_Recepciones_RecepcionId",
                table: "ChecklistsBPM");

            migrationBuilder.DropForeignKey(
                name: "FK_DocumentosProveedor_Proveedores_ProveedorId",
                table: "DocumentosProveedor");

            migrationBuilder.DropForeignKey(
                name: "FK_Facturas_OrdenesCompra_OrdenCompraId",
                table: "Facturas");

            migrationBuilder.DropForeignKey(
                name: "FK_OrdenCompraItems_Items_ItemId",
                table: "OrdenCompraItems");

            migrationBuilder.DropForeignKey(
                name: "FK_OrdenCompraItems_OrdenesCompra_OrdenCompraId",
                table: "OrdenCompraItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Recepciones_Facturas_FacturaId",
                table: "Recepciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Recepciones_Facturas_FacturaId1",
                table: "Recepciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Recepciones_OrdenesCompra_OrdenCompraId",
                table: "Recepciones");

            migrationBuilder.DropTable(
                name: "NoConformidades");

            migrationBuilder.DropTable(
                name: "TemperaturasRecepcion");

            migrationBuilder.DropIndex(
                name: "IX_OrdenesCompra_NumeroOrden",
                table: "OrdenesCompra");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ChecklistsBPM",
                table: "ChecklistsBPM");

            migrationBuilder.DropPrimaryKey(
                name: "PK_OrdenCompraItems",
                table: "OrdenCompraItems");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Facturas",
                table: "Facturas");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DocumentosProveedor",
                table: "DocumentosProveedor");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CheckListItems",
                table: "CheckListItems");

            migrationBuilder.DropColumn(
                name: "RequiereCadenaFrio",
                table: "Items");

            migrationBuilder.RenameTable(
                name: "ChecklistsBPM",
                newName: "CheckListsBPM");

            migrationBuilder.RenameTable(
                name: "OrdenCompraItems",
                newName: "OrdenCompraItem");

            migrationBuilder.RenameTable(
                name: "Facturas",
                newName: "Factura");

            migrationBuilder.RenameTable(
                name: "DocumentosProveedor",
                newName: "DocumentoProveedor");

            migrationBuilder.RenameTable(
                name: "CheckListItems",
                newName: "CheckListItem");

            migrationBuilder.RenameColumn(
                name: "FacturaId1",
                table: "Recepciones",
                newName: "ProveedorId");

            migrationBuilder.RenameIndex(
                name: "IX_Recepciones_FacturaId1",
                table: "Recepciones",
                newName: "IX_Recepciones_ProveedorId");

            migrationBuilder.RenameIndex(
                name: "IX_ChecklistsBPM_RecepcionId",
                table: "CheckListsBPM",
                newName: "IX_CheckListsBPM_RecepcionId");

            migrationBuilder.RenameIndex(
                name: "IX_OrdenCompraItems_OrdenCompraId",
                table: "OrdenCompraItem",
                newName: "IX_OrdenCompraItem_OrdenCompraId");

            migrationBuilder.RenameIndex(
                name: "IX_OrdenCompraItems_ItemId",
                table: "OrdenCompraItem",
                newName: "IX_OrdenCompraItem_ItemId");

            migrationBuilder.RenameIndex(
                name: "IX_Facturas_OrdenCompraId",
                table: "Factura",
                newName: "IX_Factura_OrdenCompraId");

            migrationBuilder.RenameIndex(
                name: "IX_DocumentosProveedor_ProveedorId",
                table: "DocumentoProveedor",
                newName: "IX_DocumentoProveedor_ProveedorId");

            migrationBuilder.RenameIndex(
                name: "IX_CheckListItems_CheckListBPMId",
                table: "CheckListItem",
                newName: "IX_CheckListItem_CheckListBPMId");

            migrationBuilder.AlterColumn<string>(
                name: "PlacaVehiculo",
                table: "Recepciones",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "NombreTransportista",
                table: "Recepciones",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Estado",
                table: "Recepciones",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaHoraTemperatura",
                table: "Recepciones",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MotivoCambioEstado",
                table: "Recepciones",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "TemperaturaAlAbrirPuertas",
                table: "Recepciones",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Telefono",
                table: "Proveedores",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RazonSocial",
                table: "Proveedores",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "NIT",
                table: "Proveedores",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaCreacion",
                table: "Proveedores",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Proveedores",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 150,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Contacto",
                table: "Proveedores",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 150);

            migrationBuilder.AlterColumn<bool>(
                name: "Activo",
                table: "Proveedores",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: true);

            migrationBuilder.AlterColumn<string>(
                name: "NumeroOrden",
                table: "OrdenesCompra",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "UnidadMedida",
                table: "Lotes",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "NumeroLote",
                table: "Lotes",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "UnidadMedida",
                table: "Items",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<decimal>(
                name: "TemperaturaObjetivo",
                table: "Items",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(float),
                oldType: "real");

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Items",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "CategoriaSanitaria",
                table: "Items",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<int>(
                name: "CategoriaId",
                table: "Items",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Descripcion",
                table: "Items",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaCreacion",
                table: "Items",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "ProveedorId",
                table: "Items",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SKU",
                table: "Items",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "TemperaturaMaxima",
                table: "Items",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TemperaturaMinima",
                table: "Items",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "VidaUtilMinimaAceptable",
                table: "Items",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "UnidadMedida",
                table: "OrdenCompraItem",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<decimal>(
                name: "CantidadEsperada",
                table: "OrdenCompraItem",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,3)",
                oldPrecision: 18,
                oldScale: 3);

            migrationBuilder.AlterColumn<string>(
                name: "RutaArchivo",
                table: "Factura",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "NumeroFactura",
                table: "Factura",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Tipo",
                table: "DocumentoProveedor",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "RutaArchivo",
                table: "DocumentoProveedor",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaVigencia",
                table: "DocumentoProveedor",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Observacion",
                table: "CheckListItem",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "CheckListItem",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AddPrimaryKey(
                name: "PK_CheckListsBPM",
                table: "CheckListsBPM",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_OrdenCompraItem",
                table: "OrdenCompraItem",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Factura",
                table: "Factura",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_DocumentoProveedor",
                table: "DocumentoProveedor",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CheckListItem",
                table: "CheckListItem",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "Categorias",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TipoAlimento = table.Column<int>(type: "int", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categorias", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RegistrosAuditoria",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UsuarioId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    NombreUsuario = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IP = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FechaHora = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Tabla = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RegistroId = table.Column<int>(type: "int", nullable: false),
                    Accion = table.Column<int>(type: "int", nullable: false),
                    ValoresAntes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ValoresDespues = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MotivoRechazo = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RegistrosAuditoria", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CheckListsBPMCategorias",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CategoriaId = table.Column<int>(type: "int", nullable: false),
                    Versión = table.Column<int>(type: "int", nullable: false),
                    FechaVigencia = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EsVigente = table.Column<bool>(type: "bit", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CriteriosJSON = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CheckListsBPMCategorias", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CheckListsBPMCategorias_Categorias_CategoriaId",
                        column: x => x.CategoriaId,
                        principalTable: "Categorias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DocumentosRequeridos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CategoriaId = table.Column<int>(type: "int", nullable: false),
                    TipoDocumento = table.Column<int>(type: "int", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EsObligatorio = table.Column<bool>(type: "bit", nullable: false),
                    VigenciaDias = table.Column<int>(type: "int", nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    Versión = table.Column<int>(type: "int", nullable: false),
                    FechaVigencia = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentosRequeridos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentosRequeridos_Categorias_CategoriaId",
                        column: x => x.CategoriaId,
                        principalTable: "Categorias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RecepcionesDocumentos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RecepcionId = table.Column<int>(type: "int", nullable: false),
                    DocumentoRequeridoId = table.Column<int>(type: "int", nullable: false),
                    NombreArchivo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RutaAlmacenamiento = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Hash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TamañoBytes = table.Column<long>(type: "bigint", nullable: false),
                    TipoMime = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FechaCarga = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CargadoPor = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    ObservacionesValidacion = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecepcionesDocumentos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecepcionesDocumentos_DocumentosRequeridos_DocumentoRequeridoId",
                        column: x => x.DocumentoRequeridoId,
                        principalTable: "DocumentosRequeridos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RecepcionesDocumentos_Recepciones_RecepcionId",
                        column: x => x.RecepcionId,
                        principalTable: "Recepciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DocumentosAdjuntos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RecepcionDocumentoId = table.Column<int>(type: "int", nullable: false),
                    NombreArchivoOriginal = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NombreArchivoAlmacenado = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RutaCompleta = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TipoMime = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TamañoBytes = table.Column<long>(type: "bigint", nullable: false),
                    HashSHA256 = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IntegridadVerificada = table.Column<bool>(type: "bit", nullable: false),
                    FechaCarga = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CargadoPor = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FechaDescarga = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DescargadoPor = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FechaEliminacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PendienteEliminacion = table.Column<bool>(type: "bit", nullable: false),
                    MotivoEliminacion = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentosAdjuntos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentosAdjuntos_RecepcionesDocumentos_RecepcionDocumentoId",
                        column: x => x.RecepcionDocumentoId,
                        principalTable: "RecepcionesDocumentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DocumentosValidacion",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RecepcionDocumentoId = table.Column<int>(type: "int", nullable: false),
                    DocumentoRequeridoId = table.Column<int>(type: "int", nullable: false),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    EsValido = table.Column<bool>(type: "bit", nullable: false),
                    ResultadoValidacion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MotivoRechazo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ValidadoPor = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FechaValidacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaVencimientoDocumento = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EstaVigente = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentosValidacion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentosValidacion_DocumentosRequeridos_DocumentoRequeridoId",
                        column: x => x.DocumentoRequeridoId,
                        principalTable: "DocumentosRequeridos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DocumentosValidacion_RecepcionesDocumentos_RecepcionDocumentoId",
                        column: x => x.RecepcionDocumentoId,
                        principalTable: "RecepcionesDocumentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Items_CategoriaId",
                table: "Items",
                column: "CategoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_Items_ProveedorId",
                table: "Items",
                column: "ProveedorId");

            migrationBuilder.CreateIndex(
                name: "IX_CheckListsBPMCategorias_CategoriaId",
                table: "CheckListsBPMCategorias",
                column: "CategoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentosAdjuntos_HashSHA256",
                table: "DocumentosAdjuntos",
                column: "HashSHA256",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DocumentosAdjuntos_PendienteEliminacion_FechaEliminacion",
                table: "DocumentosAdjuntos",
                columns: new[] { "PendienteEliminacion", "FechaEliminacion" });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentosAdjuntos_RecepcionDocumentoId",
                table: "DocumentosAdjuntos",
                column: "RecepcionDocumentoId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentosRequeridos_CategoriaId",
                table: "DocumentosRequeridos",
                column: "CategoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentosValidacion_DocumentoRequeridoId",
                table: "DocumentosValidacion",
                column: "DocumentoRequeridoId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentosValidacion_FechaValidacion",
                table: "DocumentosValidacion",
                column: "FechaValidacion");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentosValidacion_RecepcionDocumentoId_Estado",
                table: "DocumentosValidacion",
                columns: new[] { "RecepcionDocumentoId", "Estado" });

            migrationBuilder.CreateIndex(
                name: "IX_RecepcionesDocumentos_DocumentoRequeridoId",
                table: "RecepcionesDocumentos",
                column: "DocumentoRequeridoId");

            migrationBuilder.CreateIndex(
                name: "IX_RecepcionesDocumentos_RecepcionId_DocumentoRequeridoId",
                table: "RecepcionesDocumentos",
                columns: new[] { "RecepcionId", "DocumentoRequeridoId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosAuditoria_Tabla_RegistroId_FechaHora",
                table: "RegistrosAuditoria",
                columns: new[] { "Tabla", "RegistroId", "FechaHora" });

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosAuditoria_UsuarioId",
                table: "RegistrosAuditoria",
                column: "UsuarioId");

            migrationBuilder.AddForeignKey(
                name: "FK_CheckListItem_CheckListsBPM_CheckListBPMId",
                table: "CheckListItem",
                column: "CheckListBPMId",
                principalTable: "CheckListsBPM",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CheckListsBPM_Recepciones_RecepcionId",
                table: "CheckListsBPM",
                column: "RecepcionId",
                principalTable: "Recepciones",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DocumentoProveedor_Proveedores_ProveedorId",
                table: "DocumentoProveedor",
                column: "ProveedorId",
                principalTable: "Proveedores",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Factura_OrdenesCompra_OrdenCompraId",
                table: "Factura",
                column: "OrdenCompraId",
                principalTable: "OrdenesCompra",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Items_Categorias_CategoriaId",
                table: "Items",
                column: "CategoriaId",
                principalTable: "Categorias",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Items_Proveedores_ProveedorId",
                table: "Items",
                column: "ProveedorId",
                principalTable: "Proveedores",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_OrdenCompraItem_Items_ItemId",
                table: "OrdenCompraItem",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OrdenCompraItem_OrdenesCompra_OrdenCompraId",
                table: "OrdenCompraItem",
                column: "OrdenCompraId",
                principalTable: "OrdenesCompra",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Recepciones_Factura_FacturaId",
                table: "Recepciones",
                column: "FacturaId",
                principalTable: "Factura",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Recepciones_OrdenesCompra_OrdenCompraId",
                table: "Recepciones",
                column: "OrdenCompraId",
                principalTable: "OrdenesCompra",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Recepciones_Proveedores_ProveedorId",
                table: "Recepciones",
                column: "ProveedorId",
                principalTable: "Proveedores",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CheckListItem_CheckListsBPM_CheckListBPMId",
                table: "CheckListItem");

            migrationBuilder.DropForeignKey(
                name: "FK_CheckListsBPM_Recepciones_RecepcionId",
                table: "CheckListsBPM");

            migrationBuilder.DropForeignKey(
                name: "FK_DocumentoProveedor_Proveedores_ProveedorId",
                table: "DocumentoProveedor");

            migrationBuilder.DropForeignKey(
                name: "FK_Factura_OrdenesCompra_OrdenCompraId",
                table: "Factura");

            migrationBuilder.DropForeignKey(
                name: "FK_Items_Categorias_CategoriaId",
                table: "Items");

            migrationBuilder.DropForeignKey(
                name: "FK_Items_Proveedores_ProveedorId",
                table: "Items");

            migrationBuilder.DropForeignKey(
                name: "FK_OrdenCompraItem_Items_ItemId",
                table: "OrdenCompraItem");

            migrationBuilder.DropForeignKey(
                name: "FK_OrdenCompraItem_OrdenesCompra_OrdenCompraId",
                table: "OrdenCompraItem");

            migrationBuilder.DropForeignKey(
                name: "FK_Recepciones_Factura_FacturaId",
                table: "Recepciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Recepciones_OrdenesCompra_OrdenCompraId",
                table: "Recepciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Recepciones_Proveedores_ProveedorId",
                table: "Recepciones");

            migrationBuilder.DropTable(
                name: "CheckListsBPMCategorias");

            migrationBuilder.DropTable(
                name: "DocumentosAdjuntos");

            migrationBuilder.DropTable(
                name: "DocumentosValidacion");

            migrationBuilder.DropTable(
                name: "RegistrosAuditoria");

            migrationBuilder.DropTable(
                name: "RecepcionesDocumentos");

            migrationBuilder.DropTable(
                name: "DocumentosRequeridos");

            migrationBuilder.DropTable(
                name: "Categorias");

            migrationBuilder.DropIndex(
                name: "IX_Items_CategoriaId",
                table: "Items");

            migrationBuilder.DropIndex(
                name: "IX_Items_ProveedorId",
                table: "Items");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CheckListsBPM",
                table: "CheckListsBPM");

            migrationBuilder.DropPrimaryKey(
                name: "PK_OrdenCompraItem",
                table: "OrdenCompraItem");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Factura",
                table: "Factura");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DocumentoProveedor",
                table: "DocumentoProveedor");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CheckListItem",
                table: "CheckListItem");

            migrationBuilder.DropColumn(
                name: "FechaHoraTemperatura",
                table: "Recepciones");

            migrationBuilder.DropColumn(
                name: "MotivoCambioEstado",
                table: "Recepciones");

            migrationBuilder.DropColumn(
                name: "TemperaturaAlAbrirPuertas",
                table: "Recepciones");

            migrationBuilder.DropColumn(
                name: "CategoriaId",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "Descripcion",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "FechaCreacion",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "ProveedorId",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "SKU",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "TemperaturaMaxima",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "TemperaturaMinima",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "VidaUtilMinimaAceptable",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "FechaVigencia",
                table: "DocumentoProveedor");

            migrationBuilder.RenameTable(
                name: "CheckListsBPM",
                newName: "ChecklistsBPM");

            migrationBuilder.RenameTable(
                name: "OrdenCompraItem",
                newName: "OrdenCompraItems");

            migrationBuilder.RenameTable(
                name: "Factura",
                newName: "Facturas");

            migrationBuilder.RenameTable(
                name: "DocumentoProveedor",
                newName: "DocumentosProveedor");

            migrationBuilder.RenameTable(
                name: "CheckListItem",
                newName: "CheckListItems");

            migrationBuilder.RenameColumn(
                name: "ProveedorId",
                table: "Recepciones",
                newName: "FacturaId1");

            migrationBuilder.RenameIndex(
                name: "IX_Recepciones_ProveedorId",
                table: "Recepciones",
                newName: "IX_Recepciones_FacturaId1");

            migrationBuilder.RenameIndex(
                name: "IX_CheckListsBPM_RecepcionId",
                table: "ChecklistsBPM",
                newName: "IX_ChecklistsBPM_RecepcionId");

            migrationBuilder.RenameIndex(
                name: "IX_OrdenCompraItem_OrdenCompraId",
                table: "OrdenCompraItems",
                newName: "IX_OrdenCompraItems_OrdenCompraId");

            migrationBuilder.RenameIndex(
                name: "IX_OrdenCompraItem_ItemId",
                table: "OrdenCompraItems",
                newName: "IX_OrdenCompraItems_ItemId");

            migrationBuilder.RenameIndex(
                name: "IX_Factura_OrdenCompraId",
                table: "Facturas",
                newName: "IX_Facturas_OrdenCompraId");

            migrationBuilder.RenameIndex(
                name: "IX_DocumentoProveedor_ProveedorId",
                table: "DocumentosProveedor",
                newName: "IX_DocumentosProveedor_ProveedorId");

            migrationBuilder.RenameIndex(
                name: "IX_CheckListItem_CheckListBPMId",
                table: "CheckListItems",
                newName: "IX_CheckListItems_CheckListBPMId");

            migrationBuilder.AlterColumn<string>(
                name: "PlacaVehiculo",
                table: "Recepciones",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "NombreTransportista",
                table: "Recepciones",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Estado",
                table: "Recepciones",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "Telefono",
                table: "Proveedores",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RazonSocial",
                table: "Proveedores",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "NIT",
                table: "Proveedores",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaCreacion",
                table: "Proveedores",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Proveedores",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Contacto",
                table: "Proveedores",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<bool>(
                name: "Activo",
                table: "Proveedores",
                type: "bit",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<string>(
                name: "NumeroOrden",
                table: "OrdenesCompra",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "UnidadMedida",
                table: "Lotes",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "NumeroLote",
                table: "Lotes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "UnidadMedida",
                table: "Items",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<float>(
                name: "TemperaturaObjetivo",
                table: "Items",
                type: "real",
                nullable: false,
                defaultValue: 0f,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Items",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "CategoriaSanitaria",
                table: "Items",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<bool>(
                name: "RequiereCadenaFrio",
                table: "Items",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<string>(
                name: "UnidadMedida",
                table: "OrdenCompraItems",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<decimal>(
                name: "CantidadEsperada",
                table: "OrdenCompraItems",
                type: "decimal(18,3)",
                precision: 18,
                scale: 3,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AlterColumn<string>(
                name: "RutaArchivo",
                table: "Facturas",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "NumeroFactura",
                table: "Facturas",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Tipo",
                table: "DocumentosProveedor",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "RutaArchivo",
                table: "DocumentosProveedor",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Observacion",
                table: "CheckListItems",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "CheckListItems",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ChecklistsBPM",
                table: "ChecklistsBPM",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_OrdenCompraItems",
                table: "OrdenCompraItems",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Facturas",
                table: "Facturas",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_DocumentosProveedor",
                table: "DocumentosProveedor",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CheckListItems",
                table: "CheckListItems",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "NoConformidades",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RecepcionId = table.Column<int>(type: "int", nullable: false),
                    AccionCorrectiva = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    EsRechazoTotal = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NoConformidades", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NoConformidades_Recepciones_RecepcionId",
                        column: x => x.RecepcionId,
                        principalTable: "Recepciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TemperaturasRecepcion",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RecepcionId = table.Column<int>(type: "int", nullable: false),
                    PuntoControl = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Temperatura = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TemperaturasRecepcion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TemperaturasRecepcion_Recepciones_RecepcionId",
                        column: x => x.RecepcionId,
                        principalTable: "Recepciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrdenesCompra_NumeroOrden",
                table: "OrdenesCompra",
                column: "NumeroOrden",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NoConformidades_RecepcionId",
                table: "NoConformidades",
                column: "RecepcionId");

            migrationBuilder.CreateIndex(
                name: "IX_TemperaturasRecepcion_RecepcionId",
                table: "TemperaturasRecepcion",
                column: "RecepcionId");

            migrationBuilder.AddForeignKey(
                name: "FK_CheckListItems_ChecklistsBPM_CheckListBPMId",
                table: "CheckListItems",
                column: "CheckListBPMId",
                principalTable: "ChecklistsBPM",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ChecklistsBPM_Recepciones_RecepcionId",
                table: "ChecklistsBPM",
                column: "RecepcionId",
                principalTable: "Recepciones",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DocumentosProveedor_Proveedores_ProveedorId",
                table: "DocumentosProveedor",
                column: "ProveedorId",
                principalTable: "Proveedores",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Facturas_OrdenesCompra_OrdenCompraId",
                table: "Facturas",
                column: "OrdenCompraId",
                principalTable: "OrdenesCompra",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OrdenCompraItems_Items_ItemId",
                table: "OrdenCompraItems",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OrdenCompraItems_OrdenesCompra_OrdenCompraId",
                table: "OrdenCompraItems",
                column: "OrdenCompraId",
                principalTable: "OrdenesCompra",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Recepciones_Facturas_FacturaId",
                table: "Recepciones",
                column: "FacturaId",
                principalTable: "Facturas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Recepciones_Facturas_FacturaId1",
                table: "Recepciones",
                column: "FacturaId1",
                principalTable: "Facturas",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Recepciones_OrdenesCompra_OrdenCompraId",
                table: "Recepciones",
                column: "OrdenCompraId",
                principalTable: "OrdenesCompra",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
