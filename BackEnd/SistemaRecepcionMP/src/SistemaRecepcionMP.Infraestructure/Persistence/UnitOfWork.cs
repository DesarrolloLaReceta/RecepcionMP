using SistemaRecepcionMP.Domain.Interfaces;
using SistemaRecepcionMP.Domain.Interfaces.Repositories;
using SistemaRecepcionMP.Infraestructure.Persistence.Repositories;
using SistemaRecepcionMP.Domain.Entities;

namespace SistemaRecepcionMP.Infraestructure.Persistence;

public sealed class UnitOfWork : IUnitOfWork, IAsyncDisposable, IDisposable
{
    private readonly ApplicationDbContext _context;

    private IProveedorRepository? _proveedores;
    private IItemRepository? _items;
    private IOrdenCompraRepository? _ordenesCompra;
    private IRecepcionRepository? _recepciones;
    private ILoteRecibidoRepository? _lotes;
    private ICheckListBPMRepository? _checklists;
    private INoConformidadRepository? _noConformidades;
    private ITemperaturaRegistroRepository? _temperaturas;
    private ILavadoBotasManosRepository? _lavadosBotasManos;
    private IUsuarioRepository? _usuarios;
    private IBitacoraAuditoriaRepository? _bitacora;
    private IVerificacionInstalacionRepository? _verificacionesInstalaciones;
    private IRecepcionNovedadRepository? _recepcionesNovedad;
    private IRepository<LiberacionCocina>? _liberacionesCocinas;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public IProveedorRepository Proveedores
        => _proveedores ??= new ProveedorRepository(_context);

    public IItemRepository Items
        => _items ??= new ItemRepository(_context);

    public IOrdenCompraRepository OrdenesCompra
        => _ordenesCompra ??= new OrdenCompraRepository(_context);

    public IRecepcionRepository Recepciones
        => _recepciones ??= new RecepcionRepository(_context);

    public ILoteRecibidoRepository Lotes
        => _lotes ??= new LoteRecibidoRepository(_context);

    public ICheckListBPMRepository Checklists
        => _checklists ??= new CheckListBPMRepository(_context);

    public INoConformidadRepository NoConformidades
        => _noConformidades ??= new NoConformidadRepository(_context);

    public ITemperaturaRegistroRepository Temperaturas
        => _temperaturas ??= new TemperaturaRegistroRepository(_context);

    public ILavadoBotasManosRepository LavadosBotasManos
        => _lavadosBotasManos ??= new LavadoBotasManosRepository(_context);

    public IUsuarioRepository Usuarios
        => _usuarios ??= new UsuarioRepository(_context);

    public IBitacoraAuditoriaRepository Bitacora
        => _bitacora ??= new BitacoraAuditoriaRepository(_context);

    public IVerificacionInstalacionRepository VerificacionesInstalaciones
        => _verificacionesInstalaciones ??= new VerificacionInstalacionRepository(_context);

    public IRecepcionNovedadRepository RecepcionesNovedad
        => _recepcionesNovedad ??= new RecepcionNovedadRepository(_context);

    public IRepository<LiberacionCocina> LiberacionesCocinas 
        => _liberacionesCocinas ??= new LiberacionCocinaRepository(_context);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await _context.SaveChangesAsync(cancellationToken);

    public void Dispose()
        => _context.Dispose();

    public async ValueTask DisposeAsync()
        => await _context.DisposeAsync();
}