using Arc.Application.DTOs.Templates;

namespace Arc.Application.Interfaces;

public interface IBugsService
{
    Task<BugsDataDto> GetAsync(Guid pageId, Guid userId);
    Task<BugDto> AddAsync(Guid pageId, Guid userId, BugDto bug);
    Task<BugDto> UpdateAsync(Guid pageId, Guid userId, string bugId, BugDto updated);
    Task DeleteAsync(Guid pageId, Guid userId, string bugId);
}

