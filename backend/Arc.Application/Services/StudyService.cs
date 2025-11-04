using System.Text.Json;
using Arc.Application.DTOs.Templates;
using Arc.Application.Interfaces;
using Arc.Domain.Interfaces;

namespace Arc.Application.Services;

public class StudyService : IStudyService
{
    private readonly IPageRepository _pageRepository;

    public StudyService(IPageRepository pageRepository)
    {
        _pageRepository = pageRepository;
    }

    public async Task<StudyDataDto> GetAsync(Guid pageId, Guid userId)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<StudyDataDto>(page.Data) ?? new StudyDataDto();
        data.TotalTimeSpent = data.Topics.Sum(t => t.TimeSpent);
        return data;
    }

    public async Task<StudyTopicDto> AddAsync(Guid pageId, Guid userId, StudyTopicDto topic)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<StudyDataDto>(page.Data) ?? new StudyDataDto();

        topic.Id = string.IsNullOrWhiteSpace(topic.Id) ? Guid.NewGuid().ToString() : topic.Id;
        data.Topics.Add(topic);
        data.TotalTimeSpent = data.Topics.Sum(t => t.TimeSpent);

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);
        return topic;
    }

    public async Task<StudyTopicDto> UpdateAsync(Guid pageId, Guid userId, string topicId, StudyTopicDto updated)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<StudyDataDto>(page.Data) ?? new StudyDataDto();
        var topic = data.Topics.FirstOrDefault(t => t.Id == topicId) ?? throw new InvalidOperationException("Tópico não encontrado");

        topic.Topic = updated.Topic;
        topic.Notes = updated.Notes;
        topic.Progress = updated.Progress;
        topic.StudyDate = updated.StudyDate;
        topic.TimeSpent = updated.TimeSpent;

        data.TotalTimeSpent = data.Topics.Sum(t => t.TimeSpent);

        page.Data = JsonSerializer.Serialize(data);
        page.AtualizadoEm = DateTime.UtcNow;
        await _pageRepository.UpdateAsync(page);
        return topic;
    }

    public async Task DeleteAsync(Guid pageId, Guid userId, string topicId)
    {
        await EnsureAccessAsync(pageId, userId);
        var page = await _pageRepository.GetByIdAsync(pageId) ?? throw new InvalidOperationException("Página não encontrada");
        var data = JsonSerializer.Deserialize<StudyDataDto>(page.Data) ?? new StudyDataDto();
        data.Topics = data.Topics.Where(t => t.Id != topicId).ToList();
        data.TotalTimeSpent = data.Topics.Sum(t => t.TimeSpent);

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

