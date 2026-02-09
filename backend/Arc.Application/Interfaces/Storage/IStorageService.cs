using Microsoft.AspNetCore.Http;

namespace Arc.Application.Interfaces.Storage;

public interface IStorageService
{
    Task<string> UploadAsync(IFormFile file, string folder);
    Task DeleteAsync(string filePath);
}
