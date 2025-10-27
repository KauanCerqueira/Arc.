using Arc.Application.DTOs.Team;
using Arc.Application.Interfaces;
using Arc.Domain.Entities;
using Arc.Domain.Enums;
using Arc.Domain.Interfaces;

namespace Arc.Application.Services;

public class TeamService : ITeamService
{
    private readonly IWorkspaceRepository _workspaceRepository;
    private readonly IWorkspaceMemberRepository _memberRepository;
    private readonly IWorkspaceInvitationRepository _invitationRepository;
    private readonly IGroupPermissionRepository _permissionRepository;
    private readonly IUserRepository _userRepository;
    private readonly IGroupRepository _groupRepository;

    public TeamService(
        IWorkspaceRepository workspaceRepository,
        IWorkspaceMemberRepository memberRepository,
        IWorkspaceInvitationRepository invitationRepository,
        IGroupPermissionRepository permissionRepository,
        IUserRepository userRepository,
        IGroupRepository groupRepository)
    {
        _workspaceRepository = workspaceRepository;
        _memberRepository = memberRepository;
        _invitationRepository = invitationRepository;
        _permissionRepository = permissionRepository;
        _userRepository = userRepository;
        _groupRepository = groupRepository;
    }

    public async Task<WorkspaceTeamDto> GetTeamAsync(Guid workspaceId, Guid userId)
    {
        var workspace = await _workspaceRepository.GetByIdAsync(workspaceId);
        if (workspace == null)
            throw new Exception("Workspace não encontrado");

        // Verificar se o usuário tem permissão (é o dono ou é membro)
        var isOwner = workspace.UserId == userId;
        var isMember = await _memberRepository.IsUserMemberAsync(workspaceId, userId);

        if (!isOwner && !isMember)
            throw new Exception("Você não tem permissão para acessar este workspace");

        var members = await _memberRepository.GetByWorkspaceIdAsync(workspaceId);
        var invitations = await _invitationRepository.GetByWorkspaceIdAsync(workspaceId);

        var memberDtos = members.Select(m => new WorkspaceMemberDto
        {
            Id = m.Id,
            UserId = m.UserId,
            UserName = $"{m.User?.Nome} {m.User?.Sobrenome}",
            UserEmail = m.User?.Email ?? "",
            UserIcon = m.User?.Icone,
            Role = m.Role,
            JoinedAt = m.JoinedAt,
            LastAccessAt = m.LastAccessAt,
            IsActive = m.IsActive
        }).ToList();

        var invitationDtos = invitations
            .Where(i => i.Status == InvitationStatus.Pending)
            .Select(i => new WorkspaceInvitationDto
            {
                Id = i.Id,
                WorkspaceId = i.WorkspaceId,
                WorkspaceName = workspace.Nome,
                Email = i.Email,
                InvitedByUserName = $"{i.InvitedByUser?.Nome} {i.InvitedByUser?.Sobrenome}",
                Role = i.Role,
                Status = i.Status,
                CreatedAt = i.CreatedAt,
                ExpiresAt = i.ExpiresAt,
                InvitationToken = null // Não retornar o token na listagem
            }).ToList();

        return new WorkspaceTeamDto
        {
            WorkspaceId = workspace.Id,
            WorkspaceName = workspace.Nome,
            Type = workspace.Type,
            MaxMembers = workspace.MaxMembers,
            CurrentMembers = memberDtos.Count + 1, // +1 pelo owner
            Members = memberDtos,
            PendingInvitations = invitationDtos
        };
    }

    public async Task<WorkspaceMemberDto> AddMemberAsync(Guid workspaceId, Guid userId, AddMemberDto dto)
    {
        var workspace = await _workspaceRepository.GetByIdAsync(workspaceId);
        if (workspace == null)
            throw new Exception("Workspace não encontrado");

        // Verificar se o usuário tem permissão (é o dono ou é admin)
        var role = await GetUserRoleInWorkspaceAsync(workspaceId, userId);
        if (role != TeamRole.Owner && role != TeamRole.Admin)
            throw new Exception("Você não tem permissão para adicionar membros");

        // Verificar se não excede o limite
        var currentCount = await _memberRepository.GetMemberCountAsync(workspaceId);
        if (currentCount + 1 > workspace.MaxMembers)
            throw new Exception($"Limite de membros atingido ({workspace.MaxMembers} membros)");

        // Verificar se já não é membro
        var existingMember = await _memberRepository.GetByWorkspaceAndUserAsync(workspaceId, dto.UserId);
        if (existingMember != null)
            throw new Exception("Usuário já é membro deste workspace");

        var user = await _userRepository.GetByIdAsync(dto.UserId);
        if (user == null)
            throw new Exception("Usuário não encontrado");

        var member = new WorkspaceMember
        {
            WorkspaceId = workspaceId,
            UserId = dto.UserId,
            Role = dto.Role
        };

        await _memberRepository.CreateAsync(member);

        return new WorkspaceMemberDto
        {
            Id = member.Id,
            UserId = member.UserId,
            UserName = $"{user.Nome} {user.Sobrenome}",
            UserEmail = user.Email,
            UserIcon = user.Icone,
            Role = member.Role,
            JoinedAt = member.JoinedAt,
            LastAccessAt = member.LastAccessAt,
            IsActive = member.IsActive
        };
    }

    public async Task<bool> RemoveMemberAsync(Guid workspaceId, Guid userId, Guid memberId)
    {
        var workspace = await _workspaceRepository.GetByIdAsync(workspaceId);
        if (workspace == null)
            throw new Exception("Workspace não encontrado");

        // Verificar se o usuário tem permissão (é o dono ou é admin)
        var role = await GetUserRoleInWorkspaceAsync(workspaceId, userId);
        if (role != TeamRole.Owner && role != TeamRole.Admin)
            throw new Exception("Você não tem permissão para remover membros");

        var member = await _memberRepository.GetByIdAsync(memberId);
        if (member == null || member.WorkspaceId != workspaceId)
            throw new Exception("Membro não encontrado");

        // Não permitir remover o próprio usuário desta forma
        if (member.UserId == userId)
            throw new Exception("Use a função de sair do workspace para remover a si mesmo");

        // Admin não pode remover outro admin ou owner
        if (role == TeamRole.Admin && (member.Role == TeamRole.Admin || member.Role == TeamRole.Owner))
            throw new Exception("Você não tem permissão para remover este membro");

        await _memberRepository.DeleteAsync(memberId);
        return true;
    }

    public async Task<WorkspaceMemberDto> UpdateMemberRoleAsync(Guid workspaceId, Guid userId, Guid memberId, UpdateMemberRoleDto dto)
    {
        var workspace = await _workspaceRepository.GetByIdAsync(workspaceId);
        if (workspace == null)
            throw new Exception("Workspace não encontrado");

        // Apenas o dono pode alterar roles
        if (workspace.UserId != userId)
            throw new Exception("Apenas o dono do workspace pode alterar funções");

        var member = await _memberRepository.GetByIdAsync(memberId);
        if (member == null || member.WorkspaceId != workspaceId)
            throw new Exception("Membro não encontrado");

        member.Role = dto.Role;
        await _memberRepository.UpdateAsync(member);

        var user = member.User ?? await _userRepository.GetByIdAsync(member.UserId);

        return new WorkspaceMemberDto
        {
            Id = member.Id,
            UserId = member.UserId,
            UserName = $"{user?.Nome} {user?.Sobrenome}",
            UserEmail = user?.Email ?? "",
            UserIcon = user?.Icone,
            Role = member.Role,
            JoinedAt = member.JoinedAt,
            LastAccessAt = member.LastAccessAt,
            IsActive = member.IsActive
        };
    }

    public async Task<WorkspaceInvitationDto> InviteMemberAsync(Guid workspaceId, Guid userId, InviteMemberDto dto)
    {
        var workspace = await _workspaceRepository.GetByIdAsync(workspaceId);
        if (workspace == null)
            throw new Exception("Workspace não encontrado");

        // Verificar se o usuário tem permissão
        var role = await GetUserRoleInWorkspaceAsync(workspaceId, userId);
        if (role != TeamRole.Owner && role != TeamRole.Admin)
            throw new Exception("Você não tem permissão para convidar membros");

        // Verificar se não excede o limite
        var currentCount = await _memberRepository.GetMemberCountAsync(workspaceId);
        var pendingInvitations = await _invitationRepository.GetByWorkspaceIdAsync(workspaceId);
        var pendingCount = pendingInvitations.Count(i => i.Status == InvitationStatus.Pending);

        if (currentCount + pendingCount + 1 > workspace.MaxMembers)
            throw new Exception($"Limite de membros atingido ({workspace.MaxMembers} membros)");

        // Verificar se já não há convite pendente
        if (await _invitationRepository.HasPendingInvitationAsync(workspaceId, dto.Email))
            throw new Exception("Já existe um convite pendente para este e-mail");

        // Verificar se o usuário já não é membro
        var user = await _userRepository.GetByEmailAsync(dto.Email);
        if (user != null)
        {
            var isMember = await _memberRepository.IsUserMemberAsync(workspaceId, user.Id);
            if (isMember || workspace.UserId == user.Id)
                throw new Exception("Este usuário já é membro do workspace");
        }

        var invitation = new WorkspaceInvitation
        {
            WorkspaceId = workspaceId,
            Email = dto.Email,
            InvitedByUserId = userId,
            Role = dto.Role
        };

        await _invitationRepository.CreateAsync(invitation);

        var invitedByUser = await _userRepository.GetByIdAsync(userId);

        return new WorkspaceInvitationDto
        {
            Id = invitation.Id,
            WorkspaceId = invitation.WorkspaceId,
            WorkspaceName = workspace.Nome,
            Email = invitation.Email,
            InvitedByUserName = $"{invitedByUser?.Nome} {invitedByUser?.Sobrenome}",
            Role = invitation.Role,
            Status = invitation.Status,
            CreatedAt = invitation.CreatedAt,
            ExpiresAt = invitation.ExpiresAt,
            InvitationToken = invitation.InvitationToken
        };
    }

    public async Task<bool> CancelInvitationAsync(Guid workspaceId, Guid userId, Guid invitationId)
    {
        var workspace = await _workspaceRepository.GetByIdAsync(workspaceId);
        if (workspace == null)
            throw new Exception("Workspace não encontrado");

        // Verificar se o usuário tem permissão
        var role = await GetUserRoleInWorkspaceAsync(workspaceId, userId);
        if (role != TeamRole.Owner && role != TeamRole.Admin)
            throw new Exception("Você não tem permissão para cancelar convites");

        var invitation = await _invitationRepository.GetByIdAsync(invitationId);
        if (invitation == null || invitation.WorkspaceId != workspaceId)
            throw new Exception("Convite não encontrado");

        await _invitationRepository.DeleteAsync(invitationId);
        return true;
    }

    public async Task<WorkspaceMemberDto> AcceptInvitationAsync(Guid userId, string invitationToken)
    {
        var invitation = await _invitationRepository.GetByTokenAsync(invitationToken);
        if (invitation == null)
            throw new Exception("Convite não encontrado");

        if (invitation.Status != InvitationStatus.Pending)
            throw new Exception("Este convite não está mais disponível");

        if (invitation.ExpiresAt < DateTime.UtcNow)
        {
            invitation.Status = InvitationStatus.Expired;
            await _invitationRepository.UpdateAsync(invitation);
            throw new Exception("Este convite expirou");
        }

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null || user.Email.ToLower() != invitation.Email.ToLower())
            throw new Exception("Este convite não é para você");

        var workspace = await _workspaceRepository.GetByIdAsync(invitation.WorkspaceId);
        if (workspace == null)
            throw new Exception("Workspace não encontrado");

        // Verificar se não excede o limite
        var currentCount = await _memberRepository.GetMemberCountAsync(workspace.Id);
        if (currentCount + 1 > workspace.MaxMembers)
            throw new Exception("Limite de membros atingido");

        // Criar membro
        var member = new WorkspaceMember
        {
            WorkspaceId = invitation.WorkspaceId,
            UserId = userId,
            Role = invitation.Role
        };

        await _memberRepository.CreateAsync(member);

        // Atualizar convite
        invitation.Status = InvitationStatus.Accepted;
        invitation.RespondedAt = DateTime.UtcNow;
        await _invitationRepository.UpdateAsync(invitation);

        return new WorkspaceMemberDto
        {
            Id = member.Id,
            UserId = member.UserId,
            UserName = $"{user.Nome} {user.Sobrenome}",
            UserEmail = user.Email,
            UserIcon = user.Icone,
            Role = member.Role,
            JoinedAt = member.JoinedAt,
            LastAccessAt = member.LastAccessAt,
            IsActive = member.IsActive
        };
    }

    public async Task<bool> DeclineInvitationAsync(Guid userId, string invitationToken)
    {
        var invitation = await _invitationRepository.GetByTokenAsync(invitationToken);
        if (invitation == null)
            throw new Exception("Convite não encontrado");

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null || user.Email.ToLower() != invitation.Email.ToLower())
            throw new Exception("Este convite não é para você");

        invitation.Status = InvitationStatus.Declined;
        invitation.RespondedAt = DateTime.UtcNow;
        await _invitationRepository.UpdateAsync(invitation);

        return true;
    }

    public async Task<IEnumerable<WorkspaceInvitationDto>> GetPendingInvitationsAsync(string email)
    {
        var invitations = await _invitationRepository.GetPendingByEmailAsync(email);

        return invitations.Select(i => new WorkspaceInvitationDto
        {
            Id = i.Id,
            WorkspaceId = i.WorkspaceId,
            WorkspaceName = i.Workspace?.Nome ?? "",
            Email = i.Email,
            InvitedByUserName = $"{i.InvitedByUser?.Nome} {i.InvitedByUser?.Sobrenome}",
            Role = i.Role,
            Status = i.Status,
            CreatedAt = i.CreatedAt,
            ExpiresAt = i.ExpiresAt,
            InvitationToken = i.InvitationToken
        });
    }

    public async Task<bool> UpgradeWorkspaceAsync(Guid workspaceId, Guid userId, int maxMembers)
    {
        var workspace = await _workspaceRepository.GetByIdAsync(workspaceId);
        if (workspace == null)
            throw new Exception("Workspace não encontrado");

        // Apenas o dono pode fazer upgrade
        if (workspace.UserId != userId)
            throw new Exception("Apenas o dono do workspace pode fazer upgrade");

        if (maxMembers < workspace.MaxMembers)
            throw new Exception("Não é possível reduzir o limite de membros");

        if (maxMembers < 1)
            throw new Exception("O limite mínimo é 1 membro");

        workspace.MaxMembers = maxMembers;
        if (maxMembers > 1)
        {
            workspace.Type = WorkspaceType.Team;
        }

        await _workspaceRepository.UpdateAsync(workspace);
        return true;
    }

    public async Task<GroupPermissionDto> SetGroupPermissionAsync(Guid workspaceId, Guid userId, SetGroupPermissionDto dto)
    {
        var workspace = await _workspaceRepository.GetByIdAsync(workspaceId);
        if (workspace == null)
            throw new Exception("Workspace não encontrado");

        // Verificar se o usuário tem permissão (é o dono ou é admin)
        var role = await GetUserRoleInWorkspaceAsync(workspaceId, userId);
        if (role != TeamRole.Owner && role != TeamRole.Admin)
            throw new Exception("Você não tem permissão para gerenciar permissões");

        // Verificar se o grupo pertence ao workspace
        var group = await _groupRepository.GetByIdAsync(dto.GroupId);
        if (group == null || group.WorkspaceId != workspaceId)
            throw new Exception("Grupo não encontrado");

        // Verificar se o usuário alvo é membro
        var isMember = await _memberRepository.IsUserMemberAsync(workspaceId, dto.UserId);
        if (!isMember)
            throw new Exception("O usuário não é membro deste workspace");

        // Verificar se já existe permissão
        var existingPermission = await _permissionRepository.GetByGroupAndUserAsync(dto.GroupId, dto.UserId);

        GroupPermission permission;
        if (existingPermission != null)
        {
            existingPermission.CanView = dto.CanView;
            existingPermission.CanEdit = dto.CanEdit;
            existingPermission.CanDelete = dto.CanDelete;
            existingPermission.CanManagePages = dto.CanManagePages;
            await _permissionRepository.UpdateAsync(existingPermission);
            permission = existingPermission;
        }
        else
        {
            permission = new GroupPermission
            {
                GroupId = dto.GroupId,
                UserId = dto.UserId,
                CanView = dto.CanView,
                CanEdit = dto.CanEdit,
                CanDelete = dto.CanDelete,
                CanManagePages = dto.CanManagePages
            };
            await _permissionRepository.CreateAsync(permission);
        }

        var user = await _userRepository.GetByIdAsync(dto.UserId);

        return new GroupPermissionDto
        {
            Id = permission.Id,
            GroupId = permission.GroupId,
            GroupName = group.Nome,
            UserId = permission.UserId,
            UserName = $"{user?.Nome} {user?.Sobrenome}",
            UserEmail = user?.Email ?? "",
            CanView = permission.CanView,
            CanEdit = permission.CanEdit,
            CanDelete = permission.CanDelete,
            CanManagePages = permission.CanManagePages,
            CreatedAt = permission.CreatedAt,
            UpdatedAt = permission.UpdatedAt
        };
    }

    public async Task<IEnumerable<GroupPermissionDto>> GetGroupPermissionsAsync(Guid groupId, Guid userId)
    {
        var group = await _groupRepository.GetByIdAsync(groupId);
        if (group == null)
            throw new Exception("Grupo não encontrado");

        // Verificar se o usuário tem permissão
        var role = await GetUserRoleInWorkspaceAsync(group.WorkspaceId, userId);
        if (role != TeamRole.Owner && role != TeamRole.Admin)
            throw new Exception("Você não tem permissão para visualizar permissões");

        var permissions = await _permissionRepository.GetByGroupIdAsync(groupId);

        var permissionDtos = new List<GroupPermissionDto>();
        foreach (var permission in permissions)
        {
            var user = permission.User ?? await _userRepository.GetByIdAsync(permission.UserId);
            permissionDtos.Add(new GroupPermissionDto
            {
                Id = permission.Id,
                GroupId = permission.GroupId,
                GroupName = group.Nome,
                UserId = permission.UserId,
                UserName = $"{user?.Nome} {user?.Sobrenome}",
                UserEmail = user?.Email ?? "",
                CanView = permission.CanView,
                CanEdit = permission.CanEdit,
                CanDelete = permission.CanDelete,
                CanManagePages = permission.CanManagePages,
                CreatedAt = permission.CreatedAt,
                UpdatedAt = permission.UpdatedAt
            });
        }

        return permissionDtos;
    }

    public async Task<bool> RemoveGroupPermissionAsync(Guid workspaceId, Guid userId, Guid permissionId)
    {
        var workspace = await _workspaceRepository.GetByIdAsync(workspaceId);
        if (workspace == null)
            throw new Exception("Workspace não encontrado");

        // Verificar se o usuário tem permissão
        var role = await GetUserRoleInWorkspaceAsync(workspaceId, userId);
        if (role != TeamRole.Owner && role != TeamRole.Admin)
            throw new Exception("Você não tem permissão para remover permissões");

        var permission = await _permissionRepository.GetByIdAsync(permissionId);
        if (permission == null)
            throw new Exception("Permissão não encontrada");

        // Verificar se a permissão pertence a um grupo do workspace
        var group = await _groupRepository.GetByIdAsync(permission.GroupId);
        if (group == null || group.WorkspaceId != workspaceId)
            throw new Exception("Permissão não encontrada");

        await _permissionRepository.DeleteAsync(permissionId);
        return true;
    }

    private async Task<TeamRole?> GetUserRoleInWorkspaceAsync(Guid workspaceId, Guid userId)
    {
        var workspace = await _workspaceRepository.GetByIdAsync(workspaceId);
        if (workspace == null)
            return null;

        // Se é o dono, retorna Owner
        if (workspace.UserId == userId)
            return TeamRole.Owner;

        // Caso contrário, busca como membro
        return await _memberRepository.GetUserRoleAsync(workspaceId, userId);
    }
}
