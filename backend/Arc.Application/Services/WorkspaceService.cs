using Arc.Application.DTOs.Workspace;
using Arc.Application.Interfaces;
using Arc.Domain.Entities;
using Arc.Domain.Interfaces;
using System.Text.Json;

namespace Arc.Application.Services;

public class WorkspaceService : IWorkspaceService
{
    private readonly IWorkspaceRepository _workspaceRepository;

    public WorkspaceService(IWorkspaceRepository workspaceRepository)
    {
        _workspaceRepository = workspaceRepository;
    }

    public async Task<WorkspaceDto> GetByUserIdAsync(Guid userId)
    {
        var workspace = await _workspaceRepository.GetByUserIdAsync(userId);

        if (workspace == null)
            throw new InvalidOperationException("Workspace não encontrado");

        return MapToDto(workspace);
    }

    public async Task<List<WorkspaceDto>> GetAllByUserIdAsync(Guid userId)
    {
        var workspaces = await _workspaceRepository.GetAllByUserIdAsync(userId);
        return workspaces.Select(MapToDto).ToList();
    }

    public async Task<WorkspaceDto> GetByIdAsync(Guid userId, Guid workspaceId)
    {
        var workspace = await _workspaceRepository.GetByIdAsync(workspaceId);

        if (workspace == null || workspace.UserId != userId)
            throw new InvalidOperationException("Workspace não encontrado");

        return MapToDto(workspace);
    }

    public async Task<WorkspaceWithGroupsDto> GetWithGroupsAndPagesAsync(Guid userId, Guid workspaceId)
    {
        var workspace = await _workspaceRepository.GetWithGroupsAndPagesAsync(userId, workspaceId);

        if (workspace == null)
            throw new InvalidOperationException("Workspace não encontrado");

        return MapToWithGroupsDto(workspace);
    }

    public async Task<WorkspaceDto> CreateAsync(Guid userId, CreateWorkspaceRequestDto request)
    {
        var workspace = new Workspace
        {
            Nome = request.Nome,
            UserId = userId
        };

        var created = await _workspaceRepository.CreateAsync(workspace);
        return MapToDto(created);
    }

    public async Task<WorkspaceDto> UpdateAsync(Guid userId, Guid workspaceId, UpdateWorkspaceRequestDto request)
    {
        var workspace = await _workspaceRepository.GetByIdAsync(workspaceId);

        if (workspace == null || workspace.UserId != userId)
            throw new InvalidOperationException("Workspace não encontrado");

        if (!string.IsNullOrEmpty(request.Nome))
            workspace.Nome = request.Nome;
        if (!string.IsNullOrEmpty(request.Theme))
            workspace.Theme = request.Theme;
        if (!string.IsNullOrEmpty(request.Language))
            workspace.Language = request.Language;
        if (!string.IsNullOrEmpty(request.Timezone))
            workspace.Timezone = request.Timezone;
        if (!string.IsNullOrEmpty(request.DateFormat))
            workspace.DateFormat = request.DateFormat;

        var updated = await _workspaceRepository.UpdateAsync(workspace);
        return MapToDto(updated);
    }

    public async Task<WorkspaceSettingsDto> UpdateSettingsAsync(Guid userId, UpdateWorkspaceSettingsRequestDto request)
    {
        var workspace = await _workspaceRepository.GetByUserIdAsync(userId);

        if (workspace == null)
            throw new InvalidOperationException("Workspace não encontrado");

        if (!string.IsNullOrEmpty(request.Theme))
            workspace.Theme = request.Theme;
        if (!string.IsNullOrEmpty(request.Language))
            workspace.Language = request.Language;
        if (!string.IsNullOrEmpty(request.Timezone))
            workspace.Timezone = request.Timezone;
        if (!string.IsNullOrEmpty(request.DateFormat))
            workspace.DateFormat = request.DateFormat;

        await _workspaceRepository.UpdateAsync(workspace);

        return new WorkspaceSettingsDto
        {
            Theme = workspace.Theme,
            Language = workspace.Language,
            Timezone = workspace.Timezone,
            DateFormat = workspace.DateFormat
        };
    }

    public async Task DeleteAsync(Guid userId, Guid workspaceId)
    {
        var workspace = await _workspaceRepository.GetByIdAsync(workspaceId);

        if (workspace == null || workspace.UserId != userId)
            throw new InvalidOperationException("Workspace não encontrado");

        await _workspaceRepository.DeleteAsync(workspaceId);
    }

    private WorkspaceDto MapToDto(Workspace workspace)
    {
        return new WorkspaceDto
        {
            Id = workspace.Id,
            Nome = workspace.Nome,
            UserId = workspace.UserId,
            Settings = new WorkspaceSettingsDto
            {
                Theme = workspace.Theme,
                Language = workspace.Language,
                Timezone = workspace.Timezone,
                DateFormat = workspace.DateFormat
            },
            CriadoEm = workspace.CriadoEm,
            AtualizadoEm = workspace.AtualizadoEm
        };
    }

    private WorkspaceWithGroupsDto MapToWithGroupsDto(Workspace workspace)
    {
        return new WorkspaceWithGroupsDto
        {
            Id = workspace.Id,
            Nome = workspace.Nome,
            UserId = workspace.UserId,
            Settings = new WorkspaceSettingsDto
            {
                Theme = workspace.Theme,
                Language = workspace.Language,
                Timezone = workspace.Timezone,
                DateFormat = workspace.DateFormat
            },
            Groups = workspace.Groups.Select(g => new GroupDto
            {
                Id = g.Id,
                Nome = g.Nome,
                Descricao = g.Descricao,
                Icone = g.Icone,
                Cor = g.Cor,
                Expandido = g.Expandido,
                Favorito = g.Favorito,
                Arquivado = g.Arquivado,
                Posicao = g.Posicao,
                Pages = g.Pages.Select(p => new PageDto
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
                }).ToList(),
                CriadoEm = g.CriadoEm,
                AtualizadoEm = g.AtualizadoEm
            }).ToList(),
            CriadoEm = workspace.CriadoEm,
            AtualizadoEm = workspace.AtualizadoEm
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
