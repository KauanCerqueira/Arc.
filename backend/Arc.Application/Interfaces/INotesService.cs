using Arc.Application.DTOs.Notes;

namespace Arc.Application.Interfaces;

public interface INotesService
{
    Task<NotesDataDto> GetAsync(Guid pageId, Guid userId);
    Task<NoteDto> AddAsync(Guid pageId, Guid userId, NoteDto note);
    Task<NoteDto> UpdateAsync(Guid pageId, Guid userId, string noteId, NoteDto updated);
    Task DeleteAsync(Guid pageId, Guid userId, string noteId);
}

