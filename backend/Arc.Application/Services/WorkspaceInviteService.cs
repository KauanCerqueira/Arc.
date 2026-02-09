using Arc.Application.DTOs.Workspace;
using Arc.Domain.Entities;
using Arc.Domain.Enums;
using Arc.Domain.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Arc.Application.Services;

public class WorkspaceInviteService
{
    private readonly IWorkspaceInvitationRepository _invitationRepository;
    private readonly IWorkspaceMemberRepository _memberRepository;
    private readonly IWorkspaceRepository _workspaceRepository;
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;

    public WorkspaceInviteService(
        IWorkspaceInvitationRepository invitationRepository,
        IWorkspaceMemberRepository memberRepository,
        IWorkspaceRepository workspaceRepository,
        IUserRepository userRepository,
        IConfiguration configuration)
    {
        _invitationRepository = invitationRepository;
        _memberRepository = memberRepository;
        _workspaceRepository = workspaceRepository;
        _userRepository = userRepository;
        _configuration = configuration;
    }

    public async Task<CreateInviteResponseDto> CreateInviteAsync(Guid userId, Guid workspaceId, CreateInviteRequestDto request)
    {
        // Verify workspace exists and user has permission
        var workspace = await _workspaceRepository.GetByIdAsync(workspaceId);
        if (workspace == null)
            throw new InvalidOperationException("Workspace não encontrado");

        // Check if user is owner or admin
        var member = await _memberRepository.GetByWorkspaceAndUserAsync(workspaceId, userId);
        if (member == null && workspace.UserId != userId)
            throw new UnauthorizedAccessException("Você não tem permissão para convidar membros");

        if (member != null && member.Role != TeamRole.Owner && member.Role != TeamRole.Admin)
            throw new UnauthorizedAccessException("Apenas administradores podem criar convites");

        // Get creator info
        var creator = await _userRepository.GetByIdAsync(userId);
        if (creator == null)
            throw new InvalidOperationException("Usuário não encontrado");

        // Create invitation
        var invitation = new WorkspaceInvitation
        {
            WorkspaceId = workspaceId,
            Email = "", // For link-based invites, email is empty
            InvitedByUserId = userId,
            Role = request.Role,
            Status = InvitationStatus.Pending,
            MaxUses = request.MaxUses,
            CurrentUses = 0,
            IsActive = true
        };

        if (request.ExpiresInDays.HasValue)
        {
            invitation.ExpiresAt = DateTime.UtcNow.AddDays(request.ExpiresInDays.Value);
        }

        var created = await _invitationRepository.CreateAsync(invitation);

        // Generate invite URL
        var baseUrl = _configuration["AppSettings:BaseUrl"] ?? "http://localhost:3000";
        var inviteUrl = $"{baseUrl}/invite/{created.InvitationToken}";

        var inviteDto = MapToDto(created, workspace.Nome, $"{creator.Nome} {creator.Sobrenome}");

        return new CreateInviteResponseDto
        {
            Invite = inviteDto,
            InviteUrl = inviteUrl
        };
    }

    public async Task<List<WorkspaceInviteDto>> GetInvitesAsync(Guid userId, Guid workspaceId)
    {
        // Verify workspace exists and user has permission
        var workspace = await _workspaceRepository.GetByIdAsync(workspaceId);
        if (workspace == null)
            throw new InvalidOperationException("Workspace não encontrado");

        var member = await _memberRepository.GetByWorkspaceAndUserAsync(workspaceId, userId);
        if (member == null && workspace.UserId != userId)
            throw new UnauthorizedAccessException("Você não tem permissão para visualizar convites");

        var invitations = await _invitationRepository.GetByWorkspaceIdAsync(workspaceId);

        // Filter only active invitations
        var activeInvitations = invitations.Where(i => i.IsActive).ToList();

        var result = new List<WorkspaceInviteDto>();
        foreach (var invitation in activeInvitations)
        {
            var creator = await _userRepository.GetByIdAsync(invitation.InvitedByUserId);
            var creatorName = creator != null ? $"{creator.Nome} {creator.Sobrenome}" : "Unknown";

            result.Add(MapToDto(invitation, workspace.Nome, creatorName));
        }

        return result;
    }

    public async Task<ValidateInviteResponseDto> ValidateInviteAsync(string token)
    {
        var invitation = await _invitationRepository.GetByTokenAsync(token);

        if (invitation == null || !invitation.IsActive)
        {
            return new ValidateInviteResponseDto
            {
                IsValid = false,
                Error = "Convite inválido ou expirado"
            };
        }

        if (!invitation.CanBeUsed())
        {
            return new ValidateInviteResponseDto
            {
                IsValid = false,
                Error = invitation.MaxUses.HasValue && invitation.CurrentUses >= invitation.MaxUses.Value
                    ? "Este convite atingiu o limite de usos"
                    : "Este convite expirou"
            };
        }

        var workspace = await _workspaceRepository.GetByIdAsync(invitation.WorkspaceId);
        if (workspace == null)
        {
            return new ValidateInviteResponseDto
            {
                IsValid = false,
                Error = "Workspace não encontrado"
            };
        }

        var creator = await _userRepository.GetByIdAsync(invitation.InvitedByUserId);
        var creatorName = creator != null ? $"{creator.Nome} {creator.Sobrenome}" : "Unknown";

        return new ValidateInviteResponseDto
        {
            IsValid = true,
            Invite = MapToDto(invitation, workspace.Nome, creatorName)
        };
    }

    public async Task<AcceptInviteResponseDto> AcceptInviteAsync(Guid userId, string token)
    {
        var invitation = await _invitationRepository.GetByTokenAsync(token);

        if (invitation == null || !invitation.IsActive)
            throw new InvalidOperationException("Convite inválido ou expirado");

        if (!invitation.CanBeUsed())
        {
            var errorMsg = invitation.MaxUses.HasValue && invitation.CurrentUses >= invitation.MaxUses.Value
                ? "Este convite atingiu o limite de usos"
                : "Este convite expirou";
            throw new InvalidOperationException(errorMsg);
        }

        var workspace = await _workspaceRepository.GetByIdAsync(invitation.WorkspaceId);
        if (workspace == null)
            throw new InvalidOperationException("Workspace não encontrado");

        // Check if user is owner or already a member
        var isOwner = workspace.UserId == userId;
        var existingMember = await _memberRepository.GetByWorkspaceAndUserAsync(invitation.WorkspaceId, userId);

        if (isOwner || existingMember != null)
            throw new InvalidOperationException("Você já é membro deste workspace");

        // Add user as member
        var member = new WorkspaceMember
        {
            WorkspaceId = invitation.WorkspaceId,
            UserId = userId,
            Role = invitation.Role,
            JoinedAt = DateTime.UtcNow,
            IsActive = true
        };

        await _memberRepository.CreateAsync(member);

        // Update invitation
        invitation.CurrentUses++;
        invitation.Status = InvitationStatus.Accepted;
        invitation.RespondedAt = DateTime.UtcNow;
        await _invitationRepository.UpdateAsync(invitation);

        return new AcceptInviteResponseDto
        {
            Success = true,
            WorkspaceId = workspace.Id,
            WorkspaceName = workspace.Nome,
            Message = $"Você agora é membro do workspace {workspace.Nome}"
        };
    }

    public async Task RevokeInviteAsync(Guid userId, Guid workspaceId, Guid inviteId)
    {
        // Verify workspace exists and user has permission
        var workspace = await _workspaceRepository.GetByIdAsync(workspaceId);
        if (workspace == null)
            throw new InvalidOperationException("Workspace não encontrado");

        var member = await _memberRepository.GetByWorkspaceAndUserAsync(workspaceId, userId);
        if (member == null && workspace.UserId != userId)
            throw new UnauthorizedAccessException("Você não tem permissão para revogar convites");

        if (member != null && member.Role != TeamRole.Owner && member.Role != TeamRole.Admin)
            throw new UnauthorizedAccessException("Apenas administradores podem revogar convites");

        var invitation = await _invitationRepository.GetByIdAsync(inviteId);
        if (invitation == null || invitation.WorkspaceId != workspaceId)
            throw new InvalidOperationException("Convite não encontrado");

        invitation.IsActive = false;
        invitation.Status = InvitationStatus.Declined;
        await _invitationRepository.UpdateAsync(invitation);
    }

    public async Task<List<WorkspaceMemberDto>> GetMembersAsync(Guid userId, Guid workspaceId)
    {
        // Verify workspace exists and user has permission
        var workspace = await _workspaceRepository.GetByIdAsync(workspaceId);
        if (workspace == null)
            throw new InvalidOperationException("Workspace não encontrado");

        var userMember = await _memberRepository.GetByWorkspaceAndUserAsync(workspaceId, userId);
        if (userMember == null && workspace.UserId != userId)
            throw new UnauthorizedAccessException("Você não tem permissão para visualizar membros");

        var members = await _memberRepository.GetByWorkspaceIdAsync(workspaceId);

        var result = new List<WorkspaceMemberDto>();
        foreach (var member in members.Where(m => m.IsActive))
        {
            var user = await _userRepository.GetByIdAsync(member.UserId);
            if (user != null)
            {
                result.Add(new WorkspaceMemberDto
                {
                    UserId = user.Id,
                    WorkspaceId = workspaceId,
                    Role = member.Role,
                    UserName = $"{user.Nome} {user.Sobrenome}",
                    UserEmail = user.Email,
                    UserIcon = user.Icone,
                    JoinedAt = member.JoinedAt
                });
            }
        }

        // Add workspace owner if not already in members
        var owner = await _userRepository.GetByIdAsync(workspace.UserId);
        if (owner != null && !result.Any(m => m.UserId == owner.Id))
        {
            result.Insert(0, new WorkspaceMemberDto
            {
                UserId = owner.Id,
                WorkspaceId = workspaceId,
                Role = TeamRole.Owner,
                UserName = $"{owner.Nome} {owner.Sobrenome}",
                UserEmail = owner.Email,
                UserIcon = owner.Icone,
                JoinedAt = workspace.CriadoEm
            });
        }

        return result;
    }

    private static WorkspaceInviteDto MapToDto(WorkspaceInvitation invitation, string workspaceName, string createdByName)
    {
        return new WorkspaceInviteDto
        {
            Id = invitation.Id,
            WorkspaceId = invitation.WorkspaceId,
            WorkspaceName = workspaceName,
            Token = invitation.InvitationToken ?? string.Empty,
            Role = invitation.Role,
            CreatedById = invitation.InvitedByUserId,
            CreatedByName = createdByName,
            ExpiresAt = invitation.ExpiresAt,
            MaxUses = invitation.MaxUses,
            CurrentUses = invitation.CurrentUses,
            IsActive = invitation.IsActive,
            CreatedAt = invitation.CreatedAt
        };
    }
}
