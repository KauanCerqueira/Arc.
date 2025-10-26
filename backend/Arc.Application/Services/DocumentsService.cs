using System.Text.Json;
using Arc.Application.DTOs.Documents;
using Arc.Application.Interfaces;
using Arc.Domain.Interfaces;
using Microsoft.AspNetCore.Http;

namespace Arc.Application.Services;

public class DocumentsService : IDocumentsService
{
    private readonly IPageRepository _pageRepository;
    private readonly string _uploadPath;

    public DocumentsService(IPageRepository pageRepository)
    {
        _pageRepository = pageRepository;
        _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");

        if (!Directory.Exists(_uploadPath))
        {
            Directory.CreateDirectory(_uploadPath);
        }
    }

    public async Task<DocumentsDataDto> GetDocumentsDataAsync(Guid pageId, Guid userId)
    {
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        // Verificar acesso
        var group = await _pageRepository.GetGroupByPageIdAsync(pageId);
        if (group == null || !await HasAccessToWorkspace(group.WorkspaceId, userId))
        {
            throw new UnauthorizedAccessException("Acesso negado");
        }

        var data = JsonSerializer.Deserialize<DocumentsDataDto>(page.Data)
            ?? new DocumentsDataDto();

        data.Statistics = GenerateStatistics(data.Documents, data.Folders);

        return data;
    }

    public async Task<DocumentsStatisticsDto> GetStatisticsAsync(Guid pageId, Guid userId)
    {
        var data = await GetDocumentsDataAsync(pageId, userId);
        return data.Statistics ?? new DocumentsStatisticsDto();
    }

    public async Task<FolderDto> CreateFolderAsync(Guid pageId, Guid userId, string name, string? parent, string color)
    {
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        // Verificar acesso
        var group = await _pageRepository.GetGroupByPageIdAsync(pageId);
        if (group == null || !await HasAccessToWorkspace(group.WorkspaceId, userId))
        {
            throw new UnauthorizedAccessException("Acesso negado");
        }

        var data = JsonSerializer.Deserialize<DocumentsDataDto>(page.Data)
            ?? new DocumentsDataDto();

        var folder = new FolderDto
        {
            Id = Guid.NewGuid().ToString(),
            Name = name,
            Parent = parent,
            Color = color,
            DocumentCount = 0
        };

        data.Folders.Add(folder);

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;

        await _pageRepository.UpdateAsync(page);

        return folder;
    }

    public async Task<DocumentDto> UploadDocumentAsync(Guid pageId, Guid userId, IFormFile file, string folder, List<string> tags)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("Arquivo inválido");
        }

        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        // Verificar acesso
        var group = await _pageRepository.GetGroupByPageIdAsync(pageId);
        if (group == null || !await HasAccessToWorkspace(group.WorkspaceId, userId))
        {
            throw new UnauthorizedAccessException("Acesso negado");
        }

        // Criar diretório para a página se não existir
        var pageUploadPath = Path.Combine(_uploadPath, pageId.ToString());
        if (!Directory.Exists(pageUploadPath))
        {
            Directory.CreateDirectory(pageUploadPath);
        }

        // Gerar nome único para o arquivo
        var fileId = Guid.NewGuid().ToString();
        var extension = Path.GetExtension(file.FileName);
        var fileName = $"{fileId}{extension}";
        var filePath = Path.Combine(pageUploadPath, fileName);

        // Salvar arquivo
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Determinar tipo de arquivo
        var fileType = GetFileType(extension);

        // Criar documento
        var document = new DocumentDto
        {
            Id = fileId,
            Name = file.FileName,
            Type = fileType,
            Size = file.Length,
            Folder = folder,
            Tags = tags,
            Favorite = false,
            LastModified = DateTime.UtcNow,
            Author = "Current User", // Implementar obtenção do nome do usuário
            Url = $"/api/documents/{pageId}/{fileId}",
            ThumbnailUrl = null
        };

        // Adicionar aos documentos da página
        var data = JsonSerializer.Deserialize<DocumentsDataDto>(page.Data)
            ?? new DocumentsDataDto();

        data.Documents.Add(document);

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;

        await _pageRepository.UpdateAsync(page);

        return document;
    }

    public async Task<DocumentDto> UpdateDocumentAsync(Guid pageId, Guid userId, string documentId, UpdateDocumentRequestDto request)
    {
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        // Verificar acesso
        var group = await _pageRepository.GetGroupByPageIdAsync(pageId);
        if (group == null || !await HasAccessToWorkspace(group.WorkspaceId, userId))
        {
            throw new UnauthorizedAccessException("Acesso negado");
        }

        var data = JsonSerializer.Deserialize<DocumentsDataDto>(page.Data)
            ?? new DocumentsDataDto();

        var document = data.Documents.FirstOrDefault(d => d.Id == documentId)
            ?? throw new InvalidOperationException("Documento não encontrado");

        // Atualizar propriedades
        if (!string.IsNullOrEmpty(request.Name))
            document.Name = request.Name;

        if (!string.IsNullOrEmpty(request.Folder))
            document.Folder = request.Folder;

        if (request.Tags != null)
            document.Tags = request.Tags;

        if (request.Favorite.HasValue)
            document.Favorite = request.Favorite.Value;

        document.LastModified = DateTime.UtcNow;

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;

        await _pageRepository.UpdateAsync(page);

        return document;
    }

    public async Task DeleteDocumentAsync(Guid pageId, Guid userId, string documentId)
    {
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        // Verificar acesso
        var group = await _pageRepository.GetGroupByPageIdAsync(pageId);
        if (group == null || !await HasAccessToWorkspace(group.WorkspaceId, userId))
        {
            throw new UnauthorizedAccessException("Acesso negado");
        }

        var data = JsonSerializer.Deserialize<DocumentsDataDto>(page.Data)
            ?? new DocumentsDataDto();

        var document = data.Documents.FirstOrDefault(d => d.Id == documentId);
        if (document != null)
        {
            // Deletar arquivo físico
            var pageUploadPath = Path.Combine(_uploadPath, pageId.ToString());
            var extension = Path.GetExtension(document.Name);
            var fileName = $"{documentId}{extension}";
            var filePath = Path.Combine(pageUploadPath, fileName);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }

            // Remover da lista
            data.Documents = data.Documents.Where(d => d.Id != documentId).ToList();

            page.Data = JsonSerializer.Serialize(data);
            page.AtualizadoEm = DateTime.UtcNow;

            await _pageRepository.UpdateAsync(page);
        }
    }

    public async Task<byte[]> DownloadDocumentAsync(Guid pageId, Guid userId, string documentId)
    {
        var page = await _pageRepository.GetByIdAsync(pageId)
            ?? throw new InvalidOperationException("Página não encontrada");

        // Verificar acesso
        var group = await _pageRepository.GetGroupByPageIdAsync(pageId);
        if (group == null || !await HasAccessToWorkspace(group.WorkspaceId, userId))
        {
            throw new UnauthorizedAccessException("Acesso negado");
        }

        var data = JsonSerializer.Deserialize<DocumentsDataDto>(page.Data)
            ?? new DocumentsDataDto();

        var document = data.Documents.FirstOrDefault(d => d.Id == documentId)
            ?? throw new InvalidOperationException("Documento não encontrado");

        // Buscar arquivo físico
        var pageUploadPath = Path.Combine(_uploadPath, pageId.ToString());
        var extension = Path.GetExtension(document.Name);
        var fileName = $"{documentId}{extension}";
        var filePath = Path.Combine(pageUploadPath, fileName);

        if (!File.Exists(filePath))
        {
            throw new FileNotFoundException("Arquivo não encontrado");
        }

        return await File.ReadAllBytesAsync(filePath);
    }

    private DocumentsStatisticsDto GenerateStatistics(List<DocumentDto> documents, List<FolderDto> folders)
    {
        var stats = new DocumentsStatisticsDto
        {
            TotalDocuments = documents.Count,
            TotalSize = documents.Sum(d => d.Size),
            FavoriteCount = documents.Count(d => d.Favorite),
            DocumentsByType = documents.GroupBy(d => d.Type)
                .ToDictionary(g => g.Key, g => g.Count()),
            DocumentsByFolder = documents.GroupBy(d => d.Folder)
                .ToDictionary(g => g.Key, g => g.Count())
        };

        return stats;
    }

    private string GetFileType(string extension)
    {
        return extension.ToLower() switch
        {
            ".pdf" => "pdf",
            ".doc" or ".docx" => "doc",
            ".png" or ".jpg" or ".jpeg" or ".gif" or ".svg" => "image",
            ".cs" or ".js" or ".ts" or ".tsx" or ".jsx" or ".py" or ".java" => "code",
            ".zip" or ".rar" or ".7z" or ".tar" or ".gz" => "archive",
            _ => "other"
        };
    }

    private async Task<bool> HasAccessToWorkspace(Guid workspaceId, Guid userId)
    {
        // Implementar verificação de acesso
        return await Task.FromResult(true);
    }
}
