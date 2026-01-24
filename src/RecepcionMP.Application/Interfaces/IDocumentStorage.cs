using System.IO;
using System.Threading.Tasks;

namespace RecepcionMP.Application.Interfaces
{
    public interface IDocumentStorage
    {
        Task<string> UploadAsync(Stream content, string fileName, string container);
        Task<Stream?> DownloadAsync(string uri);
        Task DeleteAsync(string uri);
        Task<bool> ValidateHashAsync(string uri, string expectedHash);
    }
}