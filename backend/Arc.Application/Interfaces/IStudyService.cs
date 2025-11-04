using Arc.Application.DTOs.Templates;

namespace Arc.Application.Interfaces;

public interface IStudyService
{
    Task<StudyDataDto> GetAsync(Guid pageId, Guid userId);
    Task<StudyTopicDto> AddAsync(Guid pageId, Guid userId, StudyTopicDto topic);
    Task<StudyTopicDto> UpdateAsync(Guid pageId, Guid userId, string topicId, StudyTopicDto updated);
    Task DeleteAsync(Guid pageId, Guid userId, string topicId);
}

