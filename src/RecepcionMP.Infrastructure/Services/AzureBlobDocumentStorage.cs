using Azure.Storage.Blobs;
using RecepcionMP.Application.Interfaces;
using System;
using System.IO;
using System.Threading.Tasks;

namespace RecepcionMP.Infrastructure.Services
{
    public class AzureBlobDocumentStorage : IDocumentStorage
    {
        private readonly BlobServiceClient _client;
        private readonly string _container;

        public AzureBlobDocumentStorage(string connectionString, string container)
        {
            _client = new BlobServiceClient(connectionString);
            _container = container;
            var containerClient = _client.GetBlobContainerClient(container);
            containerClient.CreateIfNotExists();
        }

        public async Task DeleteAsync(string uri)
        {
            var containerClient = _client.GetBlobContainerClient(_container);
            var name = Path.GetFileName(uri);
            var blob = containerClient.GetBlobClient(name);
            await blob.DeleteIfExistsAsync();
        }

        public async Task<Stream?> DownloadAsync(string uri)
        {
            var containerClient = _client.GetBlobContainerClient(_container);
            var name = Path.GetFileName(uri);
            var blob = containerClient.GetBlobClient(name);
            var resp = await blob.DownloadAsync();
            return resp.Value.Content;
        }

        public async Task<string> UploadAsync(Stream content, string fileName, string container)
        {
            var containerClient = _client.GetBlobContainerClient(container ?? _container);
            await containerClient.CreateIfNotExistsAsync();
            var safeName = $"{Guid.NewGuid():N}_{fileName}";
            var blob = containerClient.GetBlobClient(safeName);
            content.Position = 0;
            await blob.UploadAsync(content, overwrite: true);
            // devolver URI
            return blob.Uri.ToString();
        }

        public async Task<bool> ValidateHashAsync(string uri, string expectedHash)
        {
            // Descargar y calcular hash (simple)
            using var s = await DownloadAsync(uri);
            if (s == null) return false;
            s.Position = 0;
            using var sha = System.Security.Cryptography.SHA256.Create();
            var hash = BitConverter.ToString(sha.ComputeHash(s)).Replace("-", "").ToLowerInvariant();
            return hash == expectedHash;
        }
    }
}