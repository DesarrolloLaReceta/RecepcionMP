using RecepcionMP.Application.Interfaces;

namespace RecepcionMP.Infrastructure.Services
{
    public class LocalFileDocumentStorage : IDocumentStorage
    {
        private readonly string _basePath = Path.Combine(AppContext.BaseDirectory, "uploads");

        public LocalFileDocumentStorage()
        {
            Directory.CreateDirectory(_basePath);
        }

        public async Task DeleteAsync(string uri)
        {
            var path = Path.Combine(_basePath, Path.GetFileName(uri));
            if (File.Exists(path)) File.Delete(path);
            await Task.CompletedTask;
        }

        public async Task<Stream?> DownloadAsync(string uri)
        {
            var path = Path.Combine(_basePath, Path.GetFileName(uri));
            if (!File.Exists(path)) return null;
            return await Task.FromResult<Stream>(File.OpenRead(path));
        }

        public async Task<string> UploadAsync(Stream content, string fileName, string container)
        {
            var safeName = $"{Guid.NewGuid():N}_{fileName}";
            var path = Path.Combine(_basePath, safeName);
            using var fs = File.Create(path);
            content.Position = 0;
            await content.CopyToAsync(fs);
            return path;
        }

        public Task<bool> ValidateHashAsync(string uri, string expectedHash)
        {
            // Implementación simple: siempre true (mejorar en producción)
            return Task.FromResult(true);
        }
    }
}