using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SistemaRecepcionMP.Infraestructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CategoriasItem",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RequiereCadenaFrio = table.Column<bool>(type: "bit", nullable: false),
                    RangoTemperatura_Minima = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: true),
                    RangoTemperatura_Maxima = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: true),
                    RequierePresenciaCalidad = table.Column<bool>(type: "bit", nullable: false),
                    VidaUtilMinimaDias = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CategoriasItem", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CausalesNoConformidad",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TipoAccionSugerida = table.Column<int>(type: "int", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CausalesNoConformidad", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Proveedores",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RazonSocial = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Nit = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Telefono = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    EmailContacto = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Direccion = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    CreadoEn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ActualizadoEn = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Proveedores", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Username = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Perfil = table.Column<int>(type: "int", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    CreadoEn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ChecklistsBPM",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CategoriaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Version = table.Column<int>(type: "int", nullable: false),
                    Estado = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreadoEn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChecklistsBPM", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChecklistsBPM_CategoriasItem_CategoriaId",
                        column: x => x.CategoriaId,
                        principalTable: "CategoriasItem",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Items",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CodigoInterno = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CategoriaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UnidadMedida = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    VidaUtilDias = table.Column<int>(type: "int", nullable: false),
                    RangoTemperatura_Minima = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: true),
                    RangoTemperatura_Maxima = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: true),
                    RequiereLoteProveedor = table.Column<bool>(type: "bit", nullable: false),
                    Estado = table.Column<bool>(type: "bit", nullable: false),
                    CreadoEn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Items", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Items_CategoriasItem_CategoriaId",
                        column: x => x.CategoriaId,
                        principalTable: "CategoriasItem",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TiposDocumentoExigidoCategoria",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CategoriaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TipoDocumento = table.Column<int>(type: "int", nullable: false),
                    EsObligatorio = table.Column<bool>(type: "bit", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposDocumentoExigidoCategoria", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TiposDocumentoExigidoCategoria_CategoriasItem_CategoriaId",
                        column: x => x.CategoriaId,
                        principalTable: "CategoriasItem",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ContactosProveedor",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProveedorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Cargo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Telefono = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    EsPrincipal = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactosProveedor", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContactosProveedor_Proveedores_ProveedorId",
                        column: x => x.ProveedorId,
                        principalTable: "Proveedores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DocumentosSanitariosProveedor",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProveedorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TipoDocumento = table.Column<int>(type: "int", nullable: false),
                    NumeroDocumento = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FechaExpedicion = table.Column<DateOnly>(type: "date", nullable: false),
                    FechaVencimiento = table.Column<DateOnly>(type: "date", nullable: false),
                    AdjuntoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentosSanitariosProveedor", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentosSanitariosProveedor_Proveedores_ProveedorId",
                        column: x => x.ProveedorId,
                        principalTable: "Proveedores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BitacoraAuditoria",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EntidadAfectada = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RegistroId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Accion = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ValorAnterior = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ValorNuevo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IpOrigen = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    FechaHora = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BitacoraAuditoria", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BitacoraAuditoria_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OrdenesCompra",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NumeroOC = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ProveedorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FechaEmision = table.Column<DateOnly>(type: "date", nullable: false),
                    FechaEntregaEsperada = table.Column<DateOnly>(type: "date", nullable: true),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreadoPor = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreadoEn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrdenesCompra", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrdenesCompra_Proveedores_ProveedorId",
                        column: x => x.ProveedorId,
                        principalTable: "Proveedores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OrdenesCompra_Usuarios_CreadoPor",
                        column: x => x.CreadoPor,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ItemsChecklist",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChecklistId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Criterio = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    EsCritico = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    Orden = table.Column<int>(type: "int", nullable: false),
                    TipoCriterio = table.Column<int>(type: "int", nullable: false),
                    ValorMinimo = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: true),
                    ValorMaximo = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: true),
                    Unidad = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemsChecklist", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ItemsChecklist_ChecklistsBPM_ChecklistId",
                        column: x => x.ChecklistId,
                        principalTable: "ChecklistsBPM",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DetallesOrdenCompra",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrdenCompraId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CantidadSolicitada = table.Column<decimal>(type: "decimal(12,3)", precision: 18, scale: 4, nullable: false),
                    UnidadMedida = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PrecioUnitario = table.Column<decimal>(type: "decimal(16,2)", precision: 18, scale: 4, nullable: false),
                    CantidadRecibida = table.Column<decimal>(type: "decimal(12,3)", precision: 18, scale: 4, nullable: false, defaultValue: 0m),
                    CantidadRechazada = table.Column<decimal>(type: "decimal(12,3)", precision: 18, scale: 4, nullable: false, defaultValue: 0m)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DetallesOrdenCompra", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DetallesOrdenCompra_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DetallesOrdenCompra_OrdenesCompra_OrdenCompraId",
                        column: x => x.OrdenCompraId,
                        principalTable: "OrdenesCompra",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Recepciones",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NumeroRecepcion = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    OrdenCompraId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProveedorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FechaRecepcion = table.Column<DateOnly>(type: "date", nullable: false),
                    HoraLlegadaVehiculo = table.Column<TimeOnly>(type: "time", nullable: false),
                    PlacaVehiculo = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    NombreTransportista = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Estado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Resultado = table.Column<int>(type: "int", nullable: true),
                    ObservacionesGenerales = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreadoPorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreadoEn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ActualizadoEn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaFinalizacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OrdenCompraId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recepciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Recepciones_OrdenesCompra_OrdenCompraId",
                        column: x => x.OrdenCompraId,
                        principalTable: "OrdenesCompra",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Recepciones_OrdenesCompra_OrdenCompraId1",
                        column: x => x.OrdenCompraId1,
                        principalTable: "OrdenesCompra",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Recepciones_Proveedores_ProveedorId",
                        column: x => x.ProveedorId,
                        principalTable: "Proveedores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Recepciones_Usuarios_CreadoPorId",
                        column: x => x.CreadoPorId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Facturas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RecepcionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NumeroFactura = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FechaFactura = table.Column<DateOnly>(type: "date", nullable: false),
                    ValorTotal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 4, nullable: false),
                    AdjuntoUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NotaCreditoNumero = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NotaCreditoValor = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: true),
                    RecepcionId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Facturas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Facturas_Recepciones_RecepcionId",
                        column: x => x.RecepcionId,
                        principalTable: "Recepciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Facturas_Recepciones_RecepcionId1",
                        column: x => x.RecepcionId1,
                        principalTable: "Recepciones",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "InspeccionesVehiculo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RecepcionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TemperaturaInicial = table.Column<decimal>(type: "decimal(5,2)", precision: 18, scale: 4, nullable: true),
                    TemperaturaDentroRango = table.Column<bool>(type: "bit", nullable: false),
                    IntegridadEmpaque = table.Column<bool>(type: "bit", nullable: false),
                    LimpiezaVehiculo = table.Column<bool>(type: "bit", nullable: false),
                    PresenciaOloresExtranos = table.Column<bool>(type: "bit", nullable: false),
                    PlagasVisible = table.Column<bool>(type: "bit", nullable: false),
                    DocumentosTransporteOk = table.Column<bool>(type: "bit", nullable: false),
                    Resultado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    RegistradoPor = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FechaRegistro = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InspeccionesVehiculo", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InspeccionesVehiculo_Recepciones_RecepcionId",
                        column: x => x.RecepcionId,
                        principalTable: "Recepciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InspeccionesVehiculo_Usuarios_RegistradoPor",
                        column: x => x.RegistradoPor,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RecepcionItem",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RecepcionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DetalleOrdenCompraId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CantidadEsperada = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    CantidadRecibida = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    CantidadRechazada = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    UnidadMedida = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecepcionItem", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecepcionItem_DetallesOrdenCompra_DetalleOrdenCompraId",
                        column: x => x.DetalleOrdenCompraId,
                        principalTable: "DetallesOrdenCompra",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RecepcionItem_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RecepcionItem_Recepciones_RecepcionId",
                        column: x => x.RecepcionId,
                        principalTable: "Recepciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LotesRecibidos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RecepcionItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NumeroLoteProveedor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CodigoLoteInterno = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FechaFabricacion = table.Column<DateOnly>(type: "date", nullable: true),
                    FechaVencimiento = table.Column<DateOnly>(type: "date", nullable: true),
                    CantidadRecibida = table.Column<decimal>(type: "decimal(12,3)", precision: 18, scale: 4, nullable: false),
                    CantidadRechazada = table.Column<decimal>(type: "decimal(12,3)", precision: 18, scale: 4, nullable: false, defaultValue: 0m),
                    UnidadMedida = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TemperaturaMedida = table.Column<decimal>(type: "decimal(5,2)", precision: 18, scale: 4, nullable: true),
                    EstadoSensorial = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    EstadoRotulado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ObservacionesCalidad = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Estado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UbicacionDestino = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CodigoQr = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    RegistradoPor = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FechaRegistro = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LoteRecibido_FechaVencimiento = table.Column<DateOnly>(type: "date", nullable: false),
                    DetalleOrdenCompraId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LotesRecibidos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LotesRecibidos_DetallesOrdenCompra_DetalleOrdenCompraId",
                        column: x => x.DetalleOrdenCompraId,
                        principalTable: "DetallesOrdenCompra",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LotesRecibidos_RecepcionItem_RecepcionItemId",
                        column: x => x.RecepcionItemId,
                        principalTable: "RecepcionItem",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LotesRecibidos_Usuarios_RegistradoPor",
                        column: x => x.RegistradoPor,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Cuarentenas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LoteRecibidoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FechaCuarentena = table.Column<DateOnly>(type: "date", nullable: false),
                    FechaLiberacion = table.Column<DateOnly>(type: "date", nullable: true),
                    Motivo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    SeguidoPor = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AccionesRealizadas = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Decision = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cuarentenas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Cuarentenas_LotesRecibidos_LoteRecibidoId",
                        column: x => x.LoteRecibidoId,
                        principalTable: "LotesRecibidos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Cuarentenas_Usuarios_SeguidoPor",
                        column: x => x.SeguidoPor,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DocumentosRecepcion",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RecepcionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LoteRecibidoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TipoDocumento = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NombreArchivo = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    AdjuntoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    TipoDocumentoExigidoCategoriaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FechaCarga = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CargadoPor = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EsValido = table.Column<bool>(type: "bit", nullable: true),
                    ObservacionValidacion = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentosRecepcion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentosRecepcion_LotesRecibidos_LoteRecibidoId",
                        column: x => x.LoteRecibidoId,
                        principalTable: "LotesRecibidos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DocumentosRecepcion_Recepciones_RecepcionId",
                        column: x => x.RecepcionId,
                        principalTable: "Recepciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DocumentosRecepcion_TiposDocumentoExigidoCategoria_TipoDocumentoExigidoCategoriaId",
                        column: x => x.TipoDocumentoExigidoCategoriaId,
                        principalTable: "TiposDocumentoExigidoCategoria",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DocumentosRecepcion_Usuarios_CargadoPor",
                        column: x => x.CargadoPor,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LiberacionesLote",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LoteRecibidoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Decision = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LiberadoPor = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FechaLiberacion = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LiberacionesLote", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LiberacionesLote_LotesRecibidos_LoteRecibidoId",
                        column: x => x.LoteRecibidoId,
                        principalTable: "LotesRecibidos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LiberacionesLote_Usuarios_LiberadoPor",
                        column: x => x.LiberadoPor,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "NoConformidades",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Numero = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Titulo = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    LoteRecibidoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Tipo = table.Column<int>(type: "int", nullable: false),
                    Prioridad = table.Column<int>(type: "int", nullable: false),
                    CausalId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CantidadAfectada = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    AsignadoA = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CausaRaiz = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ObservacionesCierre = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FechaLimite = table.Column<DateOnly>(type: "date", nullable: true),
                    FechaCierre = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreadoPor = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreadoEn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UsuarioCreadorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NoConformidades", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NoConformidades_CausalesNoConformidad_CausalId",
                        column: x => x.CausalId,
                        principalTable: "CausalesNoConformidad",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NoConformidades_LotesRecibidos_LoteRecibidoId",
                        column: x => x.LoteRecibidoId,
                        principalTable: "LotesRecibidos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_NoConformidades_Usuarios_UsuarioCreadorId",
                        column: x => x.UsuarioCreadorId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RegistrosTemperatura",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RecepcionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LoteRecibidoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Temperatura = table.Column<decimal>(type: "decimal(5,2)", precision: 18, scale: 4, nullable: false),
                    UnidadMedida = table.Column<string>(type: "nvarchar(5)", maxLength: 5, nullable: false),
                    FechaHora = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Origen = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DispositivoId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    EstaFueraDeRango = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    Observacion = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    RegistradoPor = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RegistrosTemperatura", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RegistrosTemperatura_LotesRecibidos_LoteRecibidoId",
                        column: x => x.LoteRecibidoId,
                        principalTable: "LotesRecibidos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RegistrosTemperatura_Recepciones_RecepcionId",
                        column: x => x.RecepcionId,
                        principalTable: "Recepciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RegistrosTemperatura_Usuarios_RegistradoPor",
                        column: x => x.RegistradoPor,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ResultadosChecklist",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LoteRecibidoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChecklistId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ItemChecklistId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Resultado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Observacion = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    RegistradoPor = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FechaRegistro = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ItemChecklistId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResultadosChecklist", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ResultadosChecklist_ChecklistsBPM_ChecklistId",
                        column: x => x.ChecklistId,
                        principalTable: "ChecklistsBPM",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ResultadosChecklist_ItemsChecklist_ItemChecklistId",
                        column: x => x.ItemChecklistId,
                        principalTable: "ItemsChecklist",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ResultadosChecklist_ItemsChecklist_ItemChecklistId1",
                        column: x => x.ItemChecklistId1,
                        principalTable: "ItemsChecklist",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ResultadosChecklist_LotesRecibidos_LoteRecibidoId",
                        column: x => x.LoteRecibidoId,
                        principalTable: "LotesRecibidos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ResultadosChecklist_Usuarios_RegistradoPor",
                        column: x => x.RegistradoPor,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AccionesCorrectivas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NoConformidadId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DescripcionAccion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ResponsableId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FechaCompromiso = table.Column<DateOnly>(type: "date", nullable: false),
                    FechaCierre = table.Column<DateOnly>(type: "date", nullable: true),
                    Estado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    EvidenciaUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
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
                    table.ForeignKey(
                        name: "FK_AccionesCorrectivas_Usuarios_ResponsableId",
                        column: x => x.ResponsableId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

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
                name: "IX_AccionesCorrectivas_NoConformidadId",
                table: "AccionesCorrectivas",
                column: "NoConformidadId");

            migrationBuilder.CreateIndex(
                name: "IX_AccionesCorrectivas_ResponsableId",
                table: "AccionesCorrectivas",
                column: "ResponsableId");

            migrationBuilder.CreateIndex(
                name: "IX_BitacoraAuditoria_EntidadAfectada_RegistroId",
                table: "BitacoraAuditoria",
                columns: new[] { "EntidadAfectada", "RegistroId" });

            migrationBuilder.CreateIndex(
                name: "IX_BitacoraAuditoria_FechaHora",
                table: "BitacoraAuditoria",
                column: "FechaHora");

            migrationBuilder.CreateIndex(
                name: "IX_BitacoraAuditoria_UsuarioId",
                table: "BitacoraAuditoria",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_ChecklistsBPM_CategoriaId_Estado",
                table: "ChecklistsBPM",
                columns: new[] { "CategoriaId", "Estado" },
                unique: true,
                filter: "[Estado] = 1");

            migrationBuilder.CreateIndex(
                name: "IX_ComentariosNoConformidad_AutorId",
                table: "ComentariosNoConformidad",
                column: "AutorId");

            migrationBuilder.CreateIndex(
                name: "IX_ComentariosNoConformidad_NoConformidadId",
                table: "ComentariosNoConformidad",
                column: "NoConformidadId");

            migrationBuilder.CreateIndex(
                name: "IX_ContactosProveedor_ProveedorId",
                table: "ContactosProveedor",
                column: "ProveedorId");

            migrationBuilder.CreateIndex(
                name: "IX_Cuarentenas_LoteRecibidoId",
                table: "Cuarentenas",
                column: "LoteRecibidoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Cuarentenas_SeguidoPor",
                table: "Cuarentenas",
                column: "SeguidoPor");

            migrationBuilder.CreateIndex(
                name: "IX_DetallesOrdenCompra_ItemId",
                table: "DetallesOrdenCompra",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_DetallesOrdenCompra_OrdenCompraId",
                table: "DetallesOrdenCompra",
                column: "OrdenCompraId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentosRecepcion_CargadoPor",
                table: "DocumentosRecepcion",
                column: "CargadoPor");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentosRecepcion_LoteRecibidoId",
                table: "DocumentosRecepcion",
                column: "LoteRecibidoId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentosRecepcion_RecepcionId",
                table: "DocumentosRecepcion",
                column: "RecepcionId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentosRecepcion_TipoDocumentoExigidoCategoriaId",
                table: "DocumentosRecepcion",
                column: "TipoDocumentoExigidoCategoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentosSanitariosProveedor_ProveedorId",
                table: "DocumentosSanitariosProveedor",
                column: "ProveedorId");

            migrationBuilder.CreateIndex(
                name: "IX_Facturas_RecepcionId",
                table: "Facturas",
                column: "RecepcionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Facturas_RecepcionId1",
                table: "Facturas",
                column: "RecepcionId1");

            migrationBuilder.CreateIndex(
                name: "IX_InspeccionesVehiculo_RecepcionId",
                table: "InspeccionesVehiculo",
                column: "RecepcionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InspeccionesVehiculo_RegistradoPor",
                table: "InspeccionesVehiculo",
                column: "RegistradoPor");

            migrationBuilder.CreateIndex(
                name: "IX_Items_CategoriaId",
                table: "Items",
                column: "CategoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_ItemsChecklist_ChecklistId_Orden",
                table: "ItemsChecklist",
                columns: new[] { "ChecklistId", "Orden" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LiberacionesLote_LiberadoPor",
                table: "LiberacionesLote",
                column: "LiberadoPor");

            migrationBuilder.CreateIndex(
                name: "IX_LiberacionesLote_LoteRecibidoId",
                table: "LiberacionesLote",
                column: "LoteRecibidoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LotesRecibidos_CodigoLoteInterno",
                table: "LotesRecibidos",
                column: "CodigoLoteInterno",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LotesRecibidos_DetalleOrdenCompraId",
                table: "LotesRecibidos",
                column: "DetalleOrdenCompraId");

            migrationBuilder.CreateIndex(
                name: "IX_LotesRecibidos_RecepcionItemId",
                table: "LotesRecibidos",
                column: "RecepcionItemId");

            migrationBuilder.CreateIndex(
                name: "IX_LotesRecibidos_RegistradoPor",
                table: "LotesRecibidos",
                column: "RegistradoPor");

            migrationBuilder.CreateIndex(
                name: "IX_NoConformidades_CausalId",
                table: "NoConformidades",
                column: "CausalId");

            migrationBuilder.CreateIndex(
                name: "IX_NoConformidades_LoteRecibidoId",
                table: "NoConformidades",
                column: "LoteRecibidoId");

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
                name: "IX_OrdenesCompra_CreadoPor",
                table: "OrdenesCompra",
                column: "CreadoPor");

            migrationBuilder.CreateIndex(
                name: "IX_OrdenesCompra_NumeroOC",
                table: "OrdenesCompra",
                column: "NumeroOC",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrdenesCompra_ProveedorId",
                table: "OrdenesCompra",
                column: "ProveedorId");

            migrationBuilder.CreateIndex(
                name: "IX_Recepciones_CreadoPorId",
                table: "Recepciones",
                column: "CreadoPorId");

            migrationBuilder.CreateIndex(
                name: "IX_Recepciones_NumeroRecepcion",
                table: "Recepciones",
                column: "NumeroRecepcion",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Recepciones_OrdenCompraId",
                table: "Recepciones",
                column: "OrdenCompraId");

            migrationBuilder.CreateIndex(
                name: "IX_Recepciones_OrdenCompraId1",
                table: "Recepciones",
                column: "OrdenCompraId1");

            migrationBuilder.CreateIndex(
                name: "IX_Recepciones_ProveedorId",
                table: "Recepciones",
                column: "ProveedorId");

            migrationBuilder.CreateIndex(
                name: "IX_RecepcionItem_DetalleOrdenCompraId",
                table: "RecepcionItem",
                column: "DetalleOrdenCompraId");

            migrationBuilder.CreateIndex(
                name: "IX_RecepcionItem_ItemId",
                table: "RecepcionItem",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_RecepcionItem_RecepcionId",
                table: "RecepcionItem",
                column: "RecepcionId");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosTemperatura_LoteRecibidoId",
                table: "RegistrosTemperatura",
                column: "LoteRecibidoId");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosTemperatura_RecepcionId",
                table: "RegistrosTemperatura",
                column: "RecepcionId");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosTemperatura_RegistradoPor",
                table: "RegistrosTemperatura",
                column: "RegistradoPor");

            migrationBuilder.CreateIndex(
                name: "IX_ResultadosChecklist_ChecklistId",
                table: "ResultadosChecklist",
                column: "ChecklistId");

            migrationBuilder.CreateIndex(
                name: "IX_ResultadosChecklist_ItemChecklistId",
                table: "ResultadosChecklist",
                column: "ItemChecklistId");

            migrationBuilder.CreateIndex(
                name: "IX_ResultadosChecklist_ItemChecklistId1",
                table: "ResultadosChecklist",
                column: "ItemChecklistId1");

            migrationBuilder.CreateIndex(
                name: "IX_ResultadosChecklist_LoteRecibidoId_ItemChecklistId",
                table: "ResultadosChecklist",
                columns: new[] { "LoteRecibidoId", "ItemChecklistId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ResultadosChecklist_RegistradoPor",
                table: "ResultadosChecklist",
                column: "RegistradoPor");

            migrationBuilder.CreateIndex(
                name: "IX_TiposDocumentoExigidoCategoria_CategoriaId",
                table: "TiposDocumentoExigidoCategoria",
                column: "CategoriaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccionesCorrectivas");

            migrationBuilder.DropTable(
                name: "BitacoraAuditoria");

            migrationBuilder.DropTable(
                name: "ComentariosNoConformidad");

            migrationBuilder.DropTable(
                name: "ContactosProveedor");

            migrationBuilder.DropTable(
                name: "Cuarentenas");

            migrationBuilder.DropTable(
                name: "DocumentosRecepcion");

            migrationBuilder.DropTable(
                name: "DocumentosSanitariosProveedor");

            migrationBuilder.DropTable(
                name: "Facturas");

            migrationBuilder.DropTable(
                name: "InspeccionesVehiculo");

            migrationBuilder.DropTable(
                name: "LiberacionesLote");

            migrationBuilder.DropTable(
                name: "RegistrosTemperatura");

            migrationBuilder.DropTable(
                name: "ResultadosChecklist");

            migrationBuilder.DropTable(
                name: "NoConformidades");

            migrationBuilder.DropTable(
                name: "TiposDocumentoExigidoCategoria");

            migrationBuilder.DropTable(
                name: "ItemsChecklist");

            migrationBuilder.DropTable(
                name: "CausalesNoConformidad");

            migrationBuilder.DropTable(
                name: "LotesRecibidos");

            migrationBuilder.DropTable(
                name: "ChecklistsBPM");

            migrationBuilder.DropTable(
                name: "RecepcionItem");

            migrationBuilder.DropTable(
                name: "DetallesOrdenCompra");

            migrationBuilder.DropTable(
                name: "Recepciones");

            migrationBuilder.DropTable(
                name: "Items");

            migrationBuilder.DropTable(
                name: "OrdenesCompra");

            migrationBuilder.DropTable(
                name: "CategoriasItem");

            migrationBuilder.DropTable(
                name: "Proveedores");

            migrationBuilder.DropTable(
                name: "Usuarios");
        }
    }
}
