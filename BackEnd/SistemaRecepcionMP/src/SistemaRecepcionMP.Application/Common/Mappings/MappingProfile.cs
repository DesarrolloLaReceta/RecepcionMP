using AutoMapper;
using SistemaRecepcionMP.Domain.Entities;
using SistemaRecepcionMP.Domain.Enums;

namespace SistemaRecepcionMP.Application.Common.Mappings;

/// <summary>
/// Perfil central de AutoMapper.
/// Define cómo se convierte cada entidad del Domain a su DTO de respuesta.
/// Regla general: si el nombre del campo en la entidad y el DTO es igual,
/// AutoMapper lo mapea automáticamente sin configuración adicional.
/// Solo se configura lo que difiere.
/// </summary>
public sealed class MappingProfile : Profile
{
    public MappingProfile()
    {
        AplicarMapeosUsuario();
        AplicarMapeosProveedor();
        AplicarMapeosItem();
        AplicarMapeosOrdenCompra();
        AplicarMapeosRecepcion();
        AplicarMapeosLote();
        AplicarMapeosCalidad();
        AplicarMapeosNoConformidad();
        AplicarMapeosDashboard();
    }

    // ─────────────────────────────────────────────────────────────────
    // USUARIO
    // ─────────────────────────────────────────────────────────────────
    private void AplicarMapeosUsuario()
    {
        CreateMap<Usuario, UsuarioDto>();
    }

    // ─────────────────────────────────────────────────────────────────
    // PROVEEDOR
    // ─────────────────────────────────────────────────────────────────
    private void AplicarMapeosProveedor()
    {
        CreateMap<Proveedor, ProveedorResumenDto>()
            .ForMember(dest => dest.Categorias,
                opt => opt.Ignore())
            .ForMember(dest => dest.TotalRecepciones,
                opt => opt.Ignore())
            .ForMember(dest => dest.DocumentosVigentes,
                opt => opt.MapFrom(src => src.DocumentosSanitarios
                    .Count(d => d.FechaVencimiento >= DateOnly.FromDateTime(DateTime.UtcNow) &&
                                (d.FechaVencimiento.DayNumber - DateOnly.FromDateTime(DateTime.UtcNow).DayNumber) > 30)))
            .ForMember(dest => dest.DocumentosPorVencer,
                opt => opt.MapFrom(src => src.DocumentosSanitarios
                    .Count(d => d.FechaVencimiento >= DateOnly.FromDateTime(DateTime.UtcNow) &&
                                (d.FechaVencimiento.DayNumber - DateOnly.FromDateTime(DateTime.UtcNow).DayNumber) <= 30)))
            .ForMember(dest => dest.DocumentosVencidos,
                opt => opt.MapFrom(src => src.DocumentosSanitarios
                    .Count(d => d.FechaVencimiento < DateOnly.FromDateTime(DateTime.UtcNow))))
            .ForMember(dest => dest.TasaAceptacion,
                opt => opt.Ignore());

        CreateMap<Proveedor, ProveedorDetalleDto>()
            .IncludeBase<Proveedor, ProveedorResumenDto>();

        CreateMap<ContactoProveedor, ContactoProveedorDto>();

        CreateMap<DocumentoSanitarioProveedor, DocumentoSanitarioDto>()
            .ForMember(dest => dest.EstaVigente,
                opt => opt.MapFrom(src => src.EstaVigente))
            .ForMember(dest => dest.DiasParaVencer,
                opt => opt.MapFrom(src => src.DiasParaVencer))
            .ForMember(dest => dest.EstadoVigencia,
                opt => opt.MapFrom(src => src.EstadoVigencia));
    }

    // ─────────────────────────────────────────────────────────────────
    // ÍTEM
    // ─────────────────────────────────────────────────────────────────
    private void AplicarMapeosItem()
    {
        CreateMap<CategoriaItem, CategoriaItemDto>();

        CreateMap<Item, ItemResumenDto>()
            .ForMember(dest => dest.CategoriaNombre,
                opt => opt.MapFrom(src => src.Categoria.Nombre))
            .ForMember(dest => dest.RequiereCadenaFrio,
                opt => opt.MapFrom(src => src.Categoria.RequiereCadenaFrio))
            .ForMember(dest => dest.TemperaturaMinima,
                opt => opt.MapFrom(src => src.RangoTemperatura != null
                    ? src.RangoTemperatura.Minima
                    : (decimal?)null))
            .ForMember(dest => dest.TemperaturaMaxima,
                opt => opt.MapFrom(src => src.RangoTemperatura != null
                    ? src.RangoTemperatura.Maxima
                    : (decimal?)null));

        CreateMap<Item, ItemDetalleDto>()
            .IncludeBase<Item, ItemResumenDto>()
            .ForMember(dest => dest.DocumentosRequeridos,
                opt => opt.MapFrom(src => src.Categoria.DocumentosExigidos));

        CreateMap<TipoDocumentoExigidoCategoria, TipoDocumentoExigidoDto>()
            .ForMember(dest => dest.TipoDocumento, opt => opt.MapFrom(src => src.TipoDocumento))
            .ForMember(dest => dest.EsObligatorio, opt => opt.MapFrom(src => src.EsObligatorio))
            .ForMember(dest => dest.Descripcion, opt => opt.MapFrom(src => src.Descripcion));
    }

    // ─────────────────────────────────────────────────────────────────
    // ORDEN DE COMPRA
    // ─────────────────────────────────────────────────────────────────
    private void AplicarMapeosOrdenCompra()
    {
        CreateMap<OrdenCompra, OrdenCompraResumenDto>()
            .ForMember(dest => dest.ProveedorNombre,
                opt => opt.MapFrom(src => src.Proveedor != null ? src.Proveedor.RazonSocial : string.Empty))
            .ForMember(dest => dest.ProveedorNit,
                opt => opt.MapFrom(src => src.Proveedor != null ? src.Proveedor.Nit : string.Empty))
            .ForMember(dest => dest.TotalItems,
                opt => opt.MapFrom(src => src.Detalles.Count))
            .ForMember(dest => dest.ValorTotal,
                opt => opt.MapFrom(src => src.Detalles.Sum(d => d.CantidadSolicitada * d.PrecioUnitario)))
            .ForMember(dest => dest.RequiereCadenaFrio,
                opt => opt.MapFrom(src => src.Detalles.Any(d =>
                    d.Item != null &&
                    d.Item.Categoria != null &&
                    d.Item.Categoria.RequiereCadenaFrio)))
            .ForMember(dest => dest.Detalles,
                opt => opt.MapFrom(src => src.Detalles));

        CreateMap<OrdenCompra, OrdenCompraDetalleDto>()
            .IncludeBase<OrdenCompra, OrdenCompraResumenDto>()
            .ForMember(dest => dest.CreadoPorNombre,
                opt => opt.MapFrom(src => src.UsuarioCreador.Nombre))
            .ForMember(dest => dest.Recepciones,
                opt => opt.MapFrom(src => src.Recepciones));

        
        CreateMap<DetalleOrdenCompra, DetalleOrdenCompraDto>()
            .ForMember(dest => dest.ItemNombre,
                opt => opt.MapFrom(src => src.Item.Nombre))
            .ForMember(dest => dest.ItemCodigo,
                opt => opt.MapFrom(src => src.Item.CodigoInterno))
            .ForMember(dest => dest.CategoriaNombre,
                opt => opt.MapFrom(src => src.Item.Categoria.Nombre))
            .ForMember(dest => dest.RequiereCadenaFrio,
                opt => opt.MapFrom(src => src.Item.Categoria.RequiereCadenaFrio))
            .ForMember(dest => dest.TemperaturaMinima,
                opt => opt.MapFrom(src => src.Item.RangoTemperatura != null
                    ? src.Item.RangoTemperatura.Minima : (decimal?)null))
            .ForMember(dest => dest.TemperaturaMaxima,
                opt => opt.MapFrom(src => src.Item.RangoTemperatura != null
                    ? src.Item.RangoTemperatura.Maxima : (decimal?)null))
            .ForMember(dest => dest.Subtotal,
                opt => opt.MapFrom(src => src.CantidadSolicitada * src.PrecioUnitario))
            .ForMember(dest => dest.CantidadPendiente,
                opt => opt.MapFrom(src => src.CantidadSolicitada - src.CantidadRecibida - src.CantidadRechazada));

        CreateMap<Recepcion, RecepcionResumenDto>()
            .ForMember(dest => dest.NumeroRecepcion,
                opt => opt.MapFrom(src => src.NumeroRecepcion))
            .ForMember(dest => dest.FechaRecepcion,
                opt => opt.MapFrom(src => src.FechaRecepcion))
            .ForMember(dest => dest.Estado,
                opt => opt.MapFrom(src => src.Estado));
    }

    // ─────────────────────────────────────────────────────────────────
    // RECEPCIÓN
    // ─────────────────────────────────────────────────────────────────
    private void AplicarMapeosRecepcion()
    {
        CreateMap<Recepcion, RecepcionResumenDto>()
            .ForMember(dest => dest.OrdenCompraNumero,
                opt => opt.MapFrom(src => src.OrdenCompra != null
                    ? src.OrdenCompra.NumeroOC : string.Empty))
            .ForMember(dest => dest.ProveedorId,
                opt => opt.MapFrom(src => src.ProveedorId))
            .ForMember(dest => dest.ProveedorNombre,
                opt => opt.MapFrom(src => src.Proveedor != null
                    ? src.Proveedor.RazonSocial : string.Empty))
            .ForMember(dest => dest.TotalLotes,
                opt => opt.MapFrom(src => src.Items.SelectMany(i => i.Lotes).Count()))
            .ForMember(dest => dest.LotesLiberados,
                opt => opt.MapFrom(src => src.Items.SelectMany(i => i.Lotes)
                    .Count(l => l.Estado == EstadoLote.Liberado)))
            .ForMember(dest => dest.LotesRechazados,
                opt => opt.MapFrom(src => src.Items.SelectMany(i => i.Lotes)
                    .Count(l => l.Estado == EstadoLote.RechazadoTotal
                            || l.Estado == EstadoLote.RechazadoParcial))); 

        CreateMap<Recepcion, RecepcionDetalleDto>()
            .IncludeBase<Recepcion, RecepcionResumenDto>()
            .ForMember(dest => dest.NumeroOC,
                opt => opt.MapFrom(src => src.OrdenCompra != null
                    ? src.OrdenCompra.NumeroOC : string.Empty));


        CreateMap<Factura, FacturaDto>();
        CreateMap<InspeccionVehiculo, InspeccionVehiculoDto>()
            .ForMember(dest => dest.RegistradoPorNombre,
                opt => opt.MapFrom(src => src.UsuarioRegistrador != null
                    ? src.UsuarioRegistrador.Nombre : string.Empty));

        CreateMap<DocumentoRecepcion, DocumentoRecepcionDto>()
            .ForMember(dest => dest.CargadoPorNombre,
                opt => opt.MapFrom(src => src.UsuarioCargador != null
                    ? src.UsuarioCargador.Nombre : string.Empty));

        CreateMap<TemperaturaRegistro, TemperaturaRegistroDto>()
            .ForMember(dest => dest.RegistradoPorNombre,
                opt => opt.MapFrom(src => src.UsuarioRegistrador != null
                    ? src.UsuarioRegistrador.Nombre : "Sensor automático"));
    }

    // ─────────────────────────────────────────────────────────────────
    // LOTE
    // ─────────────────────────────────────────────────────────────────
    private void AplicarMapeosLote()
    {
        CreateMap<LoteRecibido, LoteResumenDto>()
            .ForMember(dest => dest.ItemNombre,
                opt => opt.MapFrom(src => src.RecepcionItem!.Item!.Nombre))
            .ForMember(dest => dest.ItemCodigo,
                opt => opt.MapFrom(src => src.RecepcionItem!.Item!.CodigoInterno))
            .ForMember(dest => dest.DiasVidaUtilRestantes,
                opt => opt.MapFrom(src => src.VidaUtil!.DiasRestantes))
            .ForMember(dest => dest.EstaVencido,
                opt => opt.MapFrom(src => src.VidaUtil!.EstaVencido));

        CreateMap<LoteRecibido, LoteDetalleDto>()
            .IncludeBase<LoteRecibido, LoteResumenDto>();

        CreateMap<LiberacionLote, LiberacionLoteDto>()
            .ForMember(dest => dest.LiberadoPorNombre,
                opt => opt.MapFrom(src => src.UsuarioCalidad.Nombre));

        CreateMap<Cuarentena, CuarentenaDto>()
            .ForMember(dest => dest.SeguidoPorNombre,
                opt => opt.MapFrom(src => src.UsuarioCalidad.Nombre))
            .ForMember(dest => dest.EstaActiva,
                opt => opt.MapFrom(src => src.FechaLiberacion == null));
    }

    // ─────────────────────────────────────────────────────────────────
    // CALIDAD — CHECKLISTS
    // ─────────────────────────────────────────────────────────────────
    private void AplicarMapeosCalidad()
    {
        CreateMap<ChecklistBPM, ChecklistBPMDto>()
            .ForMember(dest => dest.CategoriaNombre,
                opt => opt.MapFrom(src => src.Categoria.Nombre));

        CreateMap<ItemChecklist, ItemChecklistDto>();

        CreateMap<ResultadoChecklist, ResultadoChecklistDto>()
            .ForMember(dest => dest.Criterio,
                opt => opt.MapFrom(src => src.ItemChecklist.Criterio))
            .ForMember(dest => dest.EsCritico,
                opt => opt.MapFrom(src => src.ItemChecklist.EsCritico))
            .ForMember(dest => dest.RegistradoPorNombre,
                opt => opt.MapFrom(src => src.UsuarioRegistrador.Nombre));
    }

    // ─────────────────────────────────────────────────────────────────
    // NO CONFORMIDADES
    // ─────────────────────────────────────────────────────────────────
    private void AplicarMapeosNoConformidad()
    {
        CreateMap<NoConformidad, NoConformidadResumenDto>()
            .ForMember(d => d.CausalNombre,     o => o.MapFrom(s => s.Causal.Nombre))
            .ForMember(d => d.NumeroLote,       o => o.MapFrom(s => s.LoteRecibido.CodigoLoteInterno))
            .ForMember(d => d.ItemNombre,       o => o.MapFrom(s => s.LoteRecibido.RecepcionItem!.Item!.Nombre))  // ← corregido
            .ForMember(d => d.ProveedorNombre,  o => o.MapFrom(s => s.LoteRecibido.Recepcion.Proveedor!.RazonSocial))
            .ForMember(d => d.CreadoPorNombre,  o => o.MapFrom(s => s.UsuarioCreador.Nombre))
            .ForMember(d => d.TotalAcciones,    o => o.MapFrom(s => s.AccionesCorrectivas.Count))
            .ForMember(d => d.AccionesPendientes, o => o.MapFrom(s =>
                s.AccionesCorrectivas.Count(a => a.Estado != EstadoAccionCorrectiva.Cerrada)));

        CreateMap<NoConformidad, NoConformidadDetalleDto>()
            .IncludeBase<NoConformidad, NoConformidadResumenDto>();

        CreateMap<ComentarioNoConformidad, ComentarioNCDto>()
            .ForMember(d => d.AutorNombre, o => o.MapFrom(s => s.Autor.Nombre));
    }

    // ─────────────────────────────────────────────────────────────────
    // DASHBOARD
    // ─────────────────────────────────────────────────────────────────
    private void AplicarMapeosDashboard()
    {
        CreateMap<LoteRecibido, VencimientoProximoDto>()
            .ForMember(dest => dest.CodigoLote,
                opt => opt.MapFrom(src => src.CodigoLoteInterno))
            .ForMember(dest => dest.ItemNombre,
                opt => opt.MapFrom(src => src.RecepcionItem!.Item!.Nombre))
            .ForMember(dest => dest.ProveedorNombre,
                opt => opt.MapFrom(src => src.Recepcion.Proveedor!.RazonSocial))
            .ForMember(dest => dest.DiasRestantes,
                opt => opt.MapFrom(src => src.VidaUtil!.DiasRestantes));

        CreateMap<DocumentoSanitarioProveedor, DocumentoPorVencerDto>()
            .ForMember(dest => dest.ProveedorNombre,
                opt => opt.MapFrom(src => src.Proveedor.RazonSocial))
            .ForMember(dest => dest.DiasParaVencer,
                opt => opt.MapFrom(src => src.DiasParaVencer));

        CreateMap<TemperaturaRegistro, TemperaturaFueraRangoDto>()
            .ForMember(dest => dest.NumeroRecepcion,
                opt => opt.MapFrom(src =>
                    src.Recepcion != null ? src.Recepcion.NumeroRecepcion : null))
            .ForMember(dest => dest.CodigoLote,
                opt => opt.MapFrom(src =>
                    src.LoteRecibido != null ? src.LoteRecibido.CodigoLoteInterno : null));
    }
}