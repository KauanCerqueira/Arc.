using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Arc.Application.DTOs.Documents;

// ===== ENTITIES DTOs =====

public class DocumentDto
{
    public required string Id { get; set; }

    [Required]
    [StringLength(255)]
    public required string Name { get; set; }

    [Required]
    public required string Type { get; set; } // "pdf", "doc", "image", "code", "archive", "other"

    public long Size { get; set; }

    [Required]
    public required string Folder { get; set; }

    public List<string> Tags { get; set; } = new();

    public bool Favorite { get; set; }

    public DateTime LastModified { get; set; }

    [Required]
    public required string Author { get; set; }

    public string? Url { get; set; }
    public string? ThumbnailUrl { get; set; }
}

public class FolderDto
{
    public required string Id { get; set; }

    [Required]
    [StringLength(100)]
    public required string Name { get; set; }

    public string? Parent { get; set; }

    [Required]
    public required string Color { get; set; }

    public int DocumentCount { get; set; }
}

// ===== REQUEST DTOs =====

public class CreateFolderRequestDto
{
    [Required]
    public required Guid PageId { get; set; }

    [Required]
    [StringLength(100)]
    public required string Name { get; set; }

    public string? Parent { get; set; }

    [Required]
    [StringLength(20)]
    public required string Color { get; set; }
}

public class UploadDocumentRequestDto
{
    [Required]
    public required Guid PageId { get; set; }

    [Required]
    public required IFormFile File { get; set; }

    [Required]
    public required string Folder { get; set; }

    public List<string> Tags { get; set; } = new();
}

public class UpdateDocumentRequestDto
{
    [Required]
    public required Guid PageId { get; set; }

    [Required]
    public required string DocumentId { get; set; }

    [StringLength(255)]
    public string? Name { get; set; }

    public string? Folder { get; set; }
    public List<string>? Tags { get; set; }
    public bool? Favorite { get; set; }
}

public class DeleteDocumentRequestDto
{
    [Required]
    public required Guid PageId { get; set; }

    [Required]
    public required string DocumentId { get; set; }
}

// ===== RESPONSE DTOs =====

public class DocumentsDataDto
{
    public List<DocumentDto> Documents { get; set; } = new();
    public List<FolderDto> Folders { get; set; } = new();
    public DocumentsStatisticsDto? Statistics { get; set; }
}

public class DocumentsStatisticsDto
{
    public int TotalDocuments { get; set; }
    public long TotalSize { get; set; }
    public int FavoriteCount { get; set; }
    public Dictionary<string, int> DocumentsByType { get; set; } = new();
    public Dictionary<string, int> DocumentsByFolder { get; set; } = new();
}

public class UploadDocumentResponseDto
{
    public required DocumentDto Document { get; set; }
    public required string Message { get; set; }
}
