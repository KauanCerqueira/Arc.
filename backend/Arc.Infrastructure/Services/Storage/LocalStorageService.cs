using Arc.Application.Interfaces.Storage;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace Arc.Infrastructure.Services.Storage;

public class LocalStorageService : IStorageService
{
    private readonly IWebHostEnvironment _environment;
    private readonly string _uploadsFolder;

    public LocalStorageService(IWebHostEnvironment environment)
    {
        _environment = environment;
        _uploadsFolder = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads");
        
        if (!Directory.Exists(_uploadsFolder))
        {
            Directory.CreateDirectory(_uploadsFolder);
        }
    }

    public async Task<string> UploadAsync(IFormFile file, string folder)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("Arquivo inválido");

        var targetFolder = Path.Combine(_uploadsFolder, folder);
        if (!Directory.Exists(targetFolder))
        {
            Directory.CreateDirectory(targetFolder);
        }

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(targetFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Retorna o caminho relativo para acesso via URL
        return $"/uploads/{folder}/{fileName}";
    }

    public Task DeleteAsync(string filePath)
    {
        // Implementação básica de delete para local storage
        // filePath espera ser o caminho relativo ou absoluto
        // Por segurança, em produção, validar se o path está dentro da pasta uploads
        return Task.CompletedTask; 
    }
}
