using System.Text.Json;
using SistemaRecepcionMP.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;

namespace SistemaRecepcionMP.Infraestructure.Services;

public sealed class CalidadEvidenciaUrlResolver : ICalidadEvidenciaUrlResolver
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CalidadEvidenciaUrlResolver(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? ToPublicFotoUrl(string? valorAlmacenado)
    {
        if (string.IsNullOrWhiteSpace(valorAlmacenado))
            return null;

        var v = valorAlmacenado.Trim();
        if (v.StartsWith("http://", StringComparison.OrdinalIgnoreCase)
            || v.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            return v;

        var request = _httpContextAccessor.HttpContext?.Request;
        if (v.StartsWith('/'))
            return request is null ? v : $"{request.Scheme}://{request.Host}{v}";

        var fileName = Path.GetFileName(v);
        if (request is null)
            return $"/uploads/calidad/{fileName}";

        return $"{request.Scheme}://{request.Host}/uploads/calidad/{fileName}";
    }

    public IReadOnlyList<string> ToPublicFotoUrlsFromJson(string? rutasFotosJson)
    {
        if (string.IsNullOrWhiteSpace(rutasFotosJson))
            return Array.Empty<string>();

        try
        {
            var items = JsonSerializer.Deserialize<List<string>>(rutasFotosJson);
            if (items is null || items.Count == 0)
                return Array.Empty<string>();

            return items
                .Select(ToPublicFotoUrl)
                .Where(u => !string.IsNullOrEmpty(u))
                .Select(u => u!)
                .ToList();
        }
        catch (JsonException)
        {
            return Array.Empty<string>();
        }
    }
}
