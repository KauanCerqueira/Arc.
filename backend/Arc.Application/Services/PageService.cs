using Arc.Application.DTOs.Page;
using Arc.Application.Interfaces;
using Arc.Domain.Entities;
using Arc.Domain.Interfaces;
using System.Text.Json;

namespace Arc.Application.Services;

public class PageService : IPageService
{
    private readonly IPageRepository _pageRepository;
    private readonly IGroupRepository _groupRepository;
    private readonly IWorkspaceRepository _workspaceRepository;

    public PageService(IPageRepository pageRepository, IGroupRepository groupRepository, IWorkspaceRepository workspaceRepository)
    {
        _pageRepository = pageRepository;
        _groupRepository = groupRepository;
        _workspaceRepository = workspaceRepository;
    }

    public async Task<PageDto> GetByIdAsync(Guid pageId, Guid userId)
    {
        var page = await _pageRepository.GetByIdAsync(pageId);
        if (page == null) throw new InvalidOperationException("Página não encontrada");

        await ValidateUserOwnsPage(page.GroupId, userId);
        return MapToDto(page);
    }

    public async Task<IEnumerable<PageDto>> GetByGroupIdAsync(Guid groupId, Guid userId)
    {
        await ValidateUserOwnsPage(groupId, userId);

        var pages = await _pageRepository.GetByGroupIdAsync(groupId);
        return pages.Select(MapToDto);
    }

    public async Task<IEnumerable<PageWithGroupDto>> GetFavoritesByUserAsync(Guid userId)
    {
        var workspace = await _workspaceRepository.GetByUserIdAsync(userId);
        if (workspace == null) throw new InvalidOperationException("Workspace não encontrado");

        var pages = await _pageRepository.GetFavoritesByWorkspaceIdAsync(workspace.Id);
        return pages.Select(MapToWithGroupDto);
    }

    public async Task<IEnumerable<PageWithGroupDto>> SearchAsync(Guid userId, string query)
    {
        var workspace = await _workspaceRepository.GetByUserIdAsync(userId);
        if (workspace == null) throw new InvalidOperationException("Workspace não encontrado");

        var pages = await _pageRepository.SearchAsync(workspace.Id, query);
        return pages.Select(MapToWithGroupDto);
    }

    public async Task<PageDto> CreateAsync(Guid groupId, Guid userId, CreatePageRequestDto request)
    {
        await ValidateUserOwnsPage(groupId, userId);

        var existingPages = await _pageRepository.GetByGroupIdAsync(groupId);

        var page = new Page
        {
            GroupId = groupId,
            Nome = request.Nome,
            Template = request.Template,
            Icone = request.Icone,
            Posicao = existingPages.Count()
        };

        var created = await _pageRepository.CreateAsync(page);
        return MapToDto(created);
    }

    public async Task<PageDto> UpdateAsync(Guid pageId, Guid userId, UpdatePageRequestDto request)
    {
        var page = await _pageRepository.GetByIdAsync(pageId);
        if (page == null) throw new InvalidOperationException("Página não encontrada");

        await ValidateUserOwnsPage(page.GroupId, userId);

        if (!string.IsNullOrEmpty(request.Nome)) page.Nome = request.Nome;
        if (request.Icone != null) page.Icone = request.Icone;

        var updated = await _pageRepository.UpdateAsync(page);
        return MapToDto(updated);
    }

    public async Task<PageDto> UpdateDataAsync(Guid pageId, Guid userId, UpdatePageDataRequestDto request)
    {
        var page = await _pageRepository.GetByIdAsync(pageId);
        if (page == null) throw new InvalidOperationException("Página não encontrada");

        await ValidateUserOwnsPage(page.GroupId, userId);

        page.Data = JsonSerializer.Serialize(request.Data);

        var updated = await _pageRepository.UpdateAsync(page);
        return MapToDto(updated);
    }

    public async Task<PageDto> ToggleFavoriteAsync(Guid pageId, Guid userId, bool favorito)
    {
        var page = await _pageRepository.GetByIdAsync(pageId);
        if (page == null) throw new InvalidOperationException("Página não encontrada");

        await ValidateUserOwnsPage(page.GroupId, userId);

        page.Favorito = favorito;
        var updated = await _pageRepository.UpdateAsync(page);
        return MapToDto(updated);
    }

    public async Task<PageDto> MoveToGroupAsync(Guid pageId, Guid userId, MovePageRequestDto request)
    {
        var page = await _pageRepository.GetByIdAsync(pageId);
        if (page == null) throw new InvalidOperationException("Página não encontrada");

        await ValidateUserOwnsPage(page.GroupId, userId);
        await ValidateUserOwnsPage(request.NovoGroupId, userId);

        await _pageRepository.MoveToGroupAsync(pageId, request.NovoGroupId);

        var updated = await _pageRepository.GetByIdAsync(pageId);
        return MapToDto(updated!);
    }

    public async Task ReorderAsync(Guid groupId, Guid userId, ReorderPagesRequestDto request)
    {
        await ValidateUserOwnsPage(groupId, userId);
        await _pageRepository.ReorderAsync(groupId, request.PageIds);
    }

    public async Task DeleteAsync(Guid pageId, Guid userId)
    {
        var page = await _pageRepository.GetByIdAsync(pageId);
        if (page == null) throw new InvalidOperationException("Página não encontrada");

        await ValidateUserOwnsPage(page.GroupId, userId);
        await _pageRepository.DeleteAsync(pageId);
    }

    private async Task ValidateUserOwnsPage(Guid groupId, Guid userId)
    {
        var group = await _groupRepository.GetByIdAsync(groupId);
        if (group == null) throw new InvalidOperationException("Grupo não encontrado");

        var workspace = await _workspaceRepository.GetByIdAsync(group.WorkspaceId);
        if (workspace == null || workspace.UserId != userId)
            throw new UnauthorizedAccessException("Acesso negado");
    }

    private PageDto MapToDto(Page page)
    {
        return new PageDto
        {
            Id = page.Id,
            GroupId = page.GroupId,
            Nome = page.Nome,
            Template = page.Template,
            Icone = page.Icone,
            Data = ParseJsonData(page.Data),
            Favorito = page.Favorito,
            Posicao = page.Posicao,
            CriadoEm = page.CriadoEm,
            AtualizadoEm = page.AtualizadoEm
        };
    }

    private PageWithGroupDto MapToWithGroupDto(Page page)
    {
        return new PageWithGroupDto
        {
            Id = page.Id,
            GroupId = page.GroupId,
            GroupNome = page.Group?.Nome ?? "",
            GroupIcone = page.Group?.Icone ?? "📁",
            Nome = page.Nome,
            Template = page.Template,
            Icone = page.Icone,
            Data = ParseJsonData(page.Data),
            Favorito = page.Favorito,
            Posicao = page.Posicao,
            CriadoEm = page.CriadoEm,
            AtualizadoEm = page.AtualizadoEm
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
