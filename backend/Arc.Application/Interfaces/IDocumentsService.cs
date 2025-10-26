using Arc.Application.DTOs.Documents;
using Microsoft.AspNetCore.Http;

namespace Arc.Application.Interfaces;

public interface IDocumentsService
{
    Task<DocumentsDataDto> GetDocumentsDataAsync(Guid pageId, Guid userId);
    Task<DocumentsStatisticsDto> GetStatisticsAsync(Guid pageId, Guid userId);
    Task<FolderDto> CreateFolderAsync(Guid pageId, Guid userId, string name, string? parent, string color);
    Task<DocumentDto> UploadDocumentAsync(Guid pageId, Guid userId, IFormFile file, string folder, List<string> tags);
    Task<DocumentDto> UpdateDocumentAsync(Guid pageId, Guid userId, string documentId, UpdateDocumentRequestDto request);
    Task DeleteDocumentAsync(Guid pageId, Guid userId, string documentId);
    Task<byte[]> DownloadDocumentAsync(Guid pageId, Guid userId, string documentId);
}
