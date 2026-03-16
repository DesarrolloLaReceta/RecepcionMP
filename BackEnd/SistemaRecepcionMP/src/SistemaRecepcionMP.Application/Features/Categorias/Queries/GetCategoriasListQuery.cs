using AutoMapper;
using MediatR;
using SistemaRecepcionMP.Domain.Interfaces;

namespace SistemaRecepcionMP.Application.Features.Categorias.Queries;

public record GetCategoriasListQuery : IRequest<IEnumerable<CategoriaDto>>;

public record CategoriaDto(
    Guid Id,
    string Nombre,
    string? Descripcion,
    bool RequiereCadenaFrio,
    bool RequierePresenciaCalidad,
    int VidaUtilMinimaDias,
    decimal? RangoTemperaturaMinima,
    decimal? RangoTemperaturaMaxima
);

public sealed class GetCategoriasListQueryHandler 
    : IRequestHandler<GetCategoriasListQuery, IEnumerable<CategoriaDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetCategoriasListQueryHandler(IUnitOfWork unitOfWork)
        => _unitOfWork = unitOfWork;

    public async Task<IEnumerable<CategoriaDto>> Handle(
    GetCategoriasListQuery request,
    CancellationToken cancellationToken)
    {
        var categorias = await _unitOfWork.Items.GetCategoriasAsync();

        return categorias.Select(c => new CategoriaDto(
            c.Id,
            c.Nombre,
            c.Descripcion,
            c.RequiereCadenaFrio,
            c.RequierePresenciaCalidad,
            c.VidaUtilMinimaDias,
            c.RangoTemperatura?.Minima,
            c.RangoTemperatura?.Maxima
        ));
    }
}