using System.Text.Json;
using Arc.Application.DTOs.Notes;
using Arc.Application.Interfaces;
using Arc.Domain.Interfaces;

namespace Arc.Application.Services;

public class NotesService : INotesService
{
    private readonly IPageRepository _pageRepository;

    public NotesService(IPageRepository pageRepository)
    {
        _pageRepository = pageRepository;
    }

    public async Task<NotesDataDto> GetAsync(Guid pageId, Guid userId)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        return JsonSerializer.Deserialize<NotesDataDto>(page.Data) ?? new NotesDataDto();
    }

    public async Task<NoteDto> AddAsync(Guid pageId, Guid userId, NoteDto note)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<NotesDataDto>(page.Data) ?? new NotesDataDto();

        note.Id = string.IsNullOrWhiteSpace(note.Id) ? Guid.NewGuid().ToString() : note.Id;
        note.CreatedAt = DateTime.UtcNow;
        note.UpdatedAt = DateTime.UtcNow;
        data.Notes.Add(note);

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);
        return note;
    }

    public async Task<NoteDto> UpdateAsync(Guid pageId, Guid userId, string noteId, NoteDto updated)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<NotesDataDto>(page.Data) ?? new NotesDataDto();
        var note = data.Notes.FirstOrDefault(n => n.Id == noteId) ?? throw new InvalidOperationException("Nota não encontrada");

        note.Title = updated.Title;
        note.Content = updated.Content;
        note.Tags = updated.Tags ?? new List<string>();
        note.UpdatedAt = DateTime.UtcNow;

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);
        return note;
    }

    public async Task DeleteAsync(Guid pageId, Guid userId, string noteId)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<NotesDataDto>(page.Data) ?? new NotesDataDto();
        data.Notes = data.Notes.Where(n => n.Id != noteId).ToList();
        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);
    }

    private async Task EnsureAccessAsync(Guid pageId, Guid userId)
    {
        var group = await _pageRepository.GetGroupByPageIdAsync(pageId) ?? throw new InvalidOperationException("Grupo não encontrado para a página");
        var has = await HasAccessToWorkspace(group.WorkspaceId, userId);
        if (!has) throw new UnauthorizedAccessException("Acesso negado");
    }

    private Task<bool> HasAccessToWorkspace(Guid workspaceId, Guid userId) => Task.FromResult(true);
}

