using Arc.Application.DTOs.Page;

namespace Arc.Application.Interfaces;

public interface IPageService
{
    Task<PageDto> GetByIdAsync(Guid pageId, Guid userId);
    Task<IEnumerable<PageDto>> GetByGroupIdAsync(Guid groupId, Guid userId);
    Task<IEnumerable<PageWithGroupDto>> GetFavoritesByUserAsync(Guid userId);
    Task<IEnumerable<PageWithGroupDto>> SearchAsync(Guid userId, string query);
    Task<PageDto> CreateAsync(Guid groupId, Guid userId, CreatePageRequestDto request);
    Task<PageDto> UpdateAsync(Guid pageId, Guid userId, UpdatePageRequestDto request);
    Task<PageDto> UpdateDataAsync(Guid pageId, Guid userId, UpdatePageDataRequestDto request);
    Task<PageDto> ToggleFavoriteAsync(Guid pageId, Guid userId, bool favorito);
    Task<PageDto> MoveToGroupAsync(Guid pageId, Guid userId, MovePageRequestDto request);
    Task ReorderAsync(Guid groupId, Guid userId, ReorderPagesRequestDto request);
    Task DeleteAsync(Guid pageId, Guid userId);
}
