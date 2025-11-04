using System.ComponentModel.DataAnnotations;

namespace Arc.Application.DTOs.Notes;

public class NoteDto
{
    [Required]
    public required string Id { get; set; }

    [Required]
    [StringLength(200)]
    public required string Title { get; set; }

    public string Content { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class NotesDataDto
{
    public List<NoteDto> Notes { get; set; } = new();
}

