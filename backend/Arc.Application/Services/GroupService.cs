using Arc.Application.DTOs.Group;
using Arc.Application.Interfaces;
using Arc.Domain.Entities;
using Arc.Domain.Interfaces;
using System.Text.Json;

namespace Arc.Application.Services;

public class GroupService : IGroupService
{
    private readonly IGroupRepository _groupRepository;
    private readonly IWorkspaceRepository _workspaceRepository;
    private readonly IPageRepository _pageRepository;

    public GroupService(IGroupRepository groupRepository, IWorkspaceRepository workspaceRepository, IPageRepository pageRepository)
    {
        _groupRepository = groupRepository;
        _workspaceRepository = workspaceRepository;
        _pageRepository = pageRepository;
    }

    public async Task<GroupDto> GetByIdAsync(Guid groupId, Guid userId)
    {
        var group = await _groupRepository.GetByIdAsync(groupId);
        if (group == null) throw new InvalidOperationException("Grupo não encontrado");

        await ValidateUserOwnsGroup(group.WorkspaceId, userId);
        return MapToDto(group);
    }

    public async Task<GroupWithPagesDto> GetWithPagesAsync(Guid groupId, Guid userId)
    {
        var group = await _groupRepository.GetWithPagesAsync(groupId);
        if (group == null) throw new InvalidOperationException("Grupo não encontrado");

        await ValidateUserOwnsGroup(group.WorkspaceId, userId);
        return MapToWithPagesDto(group);
    }

    public async Task<IEnumerable<GroupDto>> GetAllByUserAsync(Guid userId)
    {
        var workspace = await _workspaceRepository.GetByUserIdAsync(userId);
        if (workspace == null) throw new InvalidOperationException("Workspace não encontrado");

        var groups = await _groupRepository.GetByWorkspaceIdAsync(workspace.Id);
        return groups.Select(MapToDto);
    }

    public async Task<GroupDto> CreateAsync(Guid userId, CreateGroupRequestDto request)
    {
        var workspace = await _workspaceRepository.GetByUserIdAsync(userId);
        if (workspace == null) throw new InvalidOperationException("Workspace não encontrado");

        var group = new Group
        {
            WorkspaceId = workspace.Id,
            Nome = request.Nome,
            Descricao = request.Descricao,
            Icone = request.Icone,
            Cor = request.Cor,
            Posicao = (await _groupRepository.GetByWorkspaceIdAsync(workspace.Id)).Count()
        };

        var created = await _groupRepository.CreateAsync(group);
        return MapToDto(created);
    }

    public async Task<GroupWithPagesDto> CreateFromPresetAsync(Guid userId, CreateGroupFromPresetRequestDto request)
    {
        var workspace = await _workspaceRepository.GetByUserIdAsync(userId);
        if (workspace == null) throw new InvalidOperationException("Workspace não encontrado");

        var group = new Group
        {
            WorkspaceId = workspace.Id,
            Nome = request.Nome ?? "Novo Grupo",
            Posicao = (await _groupRepository.GetByWorkspaceIdAsync(workspace.Id)).Count()
        };

        var created = await _groupRepository.CreateAsync(group);
        return MapToWithPagesDto(created);
    }

    public async Task<GroupDto> UpdateAsync(Guid groupId, Guid userId, UpdateGroupRequestDto request)
    {
        var group = await _groupRepository.GetByIdAsync(groupId);
        if (group == null) throw new InvalidOperationException("Grupo não encontrado");

        await ValidateUserOwnsGroup(group.WorkspaceId, userId);

        if (!string.IsNullOrEmpty(request.Nome)) group.Nome = request.Nome;
        if (request.Descricao != null) group.Descricao = request.Descricao;
        if (!string.IsNullOrEmpty(request.Icone)) group.Icone = request.Icone;
        if (!string.IsNullOrEmpty(request.Cor)) group.Cor = request.Cor;

        var updated = await _groupRepository.UpdateAsync(group);
        return MapToDto(updated);
    }

    public async Task<GroupDto> ToggleExpandedAsync(Guid groupId, Guid userId, bool expandido)
    {
        var group = await _groupRepository.GetByIdAsync(groupId);
        if (group == null) throw new InvalidOperationException("Grupo não encontrado");

        await ValidateUserOwnsGroup(group.WorkspaceId, userId);

        group.Expandido = expandido;
        var updated = await _groupRepository.UpdateAsync(group);
        return MapToDto(updated);
    }

    public async Task<GroupDto> ToggleFavoriteAsync(Guid groupId, Guid userId, bool favorito)
    {
        var group = await _groupRepository.GetByIdAsync(groupId);
        if (group == null) throw new InvalidOperationException("Grupo não encontrado");

        await ValidateUserOwnsGroup(group.WorkspaceId, userId);

        group.Favorito = favorito;
        var updated = await _groupRepository.UpdateAsync(group);
        return MapToDto(updated);
    }

    public async Task ReorderAsync(Guid userId, ReorderGroupsRequestDto request)
    {
        var workspace = await _workspaceRepository.GetByUserIdAsync(userId);
        if (workspace == null) throw new InvalidOperationException("Workspace não encontrado");

        await _groupRepository.ReorderAsync(workspace.Id, request.GroupIds);
    }

    public async Task DeleteAsync(Guid groupId, Guid userId)
    {
        var group = await _groupRepository.GetByIdAsync(groupId);
        if (group == null) throw new InvalidOperationException("Grupo não encontrado");

        await ValidateUserOwnsGroup(group.WorkspaceId, userId);
        await _groupRepository.DeleteAsync(groupId);
    }

    private async Task ValidateUserOwnsGroup(Guid workspaceId, Guid userId)
    {
        var workspace = await _workspaceRepository.GetByIdAsync(workspaceId);
        if (workspace == null || workspace.UserId != userId)
            throw new UnauthorizedAccessException("Acesso negado");
    }

    private GroupDto MapToDto(Group group)
    {
        return new GroupDto
        {
            Id = group.Id,
            WorkspaceId = group.WorkspaceId,
            Nome = group.Nome,
            Descricao = group.Descricao,
            Icone = group.Icone,
            Cor = group.Cor,
            Expandido = group.Expandido,
            Favorito = group.Favorito,
            Arquivado = group.Arquivado,
            Posicao = group.Posicao,
            CriadoEm = group.CriadoEm,
            AtualizadoEm = group.AtualizadoEm
        };
    }

    private GroupWithPagesDto MapToWithPagesDto(Group group)
    {
        return new GroupWithPagesDto
        {
            Id = group.Id,
            WorkspaceId = group.WorkspaceId,
            Nome = group.Nome,
            Descricao = group.Descricao,
            Icone = group.Icone,
            Cor = group.Cor,
            Expandido = group.Expandido,
            Favorito = group.Favorito,
            Arquivado = group.Arquivado,
            Posicao = group.Posicao,
            Pages = group.Pages?.Select(p => new PageDto
            {
                Id = p.Id,
                GroupId = p.GroupId,
                Nome = p.Nome,
                Template = p.Template,
                Icone = p.Icone,
                Data = ParseJsonData(p.Data),
                Favorito = p.Favorito,
                Posicao = p.Posicao,
                CriadoEm = p.CriadoEm,
                AtualizadoEm = p.AtualizadoEm
            }).ToList() ?? new List<PageDto>(),
            CriadoEm = group.CriadoEm,
            AtualizadoEm = group.AtualizadoEm
        };
    }

    private object ParseJsonData(string jsonData)
    {
        try
        {
            return JsonSerializer.Deserialize<object>(jsonData) ?? new { };
        }
        catch
        {
            return new { };
        }
    }
}
