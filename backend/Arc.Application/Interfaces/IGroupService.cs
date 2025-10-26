using Arc.Application.DTOs.Group;

namespace Arc.Application.Interfaces;

public interface IGroupService
{
    Task<GroupDto> GetByIdAsync(Guid groupId, Guid userId);
    Task<GroupWithPagesDto> GetWithPagesAsync(Guid groupId, Guid userId);
    Task<IEnumerable<GroupDto>> GetAllByUserAsync(Guid userId);
    Task<GroupDto> CreateAsync(Guid userId, CreateGroupRequestDto request);
    Task<GroupWithPagesDto> CreateFromPresetAsync(Guid userId, CreateGroupFromPresetRequestDto request);
    Task<GroupDto> UpdateAsync(Guid groupId, Guid userId, UpdateGroupRequestDto request);
    Task<GroupDto> ToggleExpandedAsync(Guid groupId, Guid userId, bool expandido);
    Task<GroupDto> ToggleFavoriteAsync(Guid groupId, Guid userId, bool favorito);
    Task ReorderAsync(Guid userId, ReorderGroupsRequestDto request);
    Task DeleteAsync(Guid groupId, Guid userId);
}
